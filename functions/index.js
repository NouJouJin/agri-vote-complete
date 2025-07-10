/**
 * Firebase Functions v2 - 投票システム（セキュリティ強化版）
 * 投票データをGoogle Sheetsに自動記録（合言葉認証付き）
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const https = require("https");

// Admin SDK初期化
admin.initializeApp();

const { defineString } = require("firebase-functions/params");

// ★★★ 環境変数から設定を取得（Firebase Functions用） ★★★
const GAS_WEB_APP_URL = defineString("GAS_WEB_APP_URL");
const SPREADSHEET_SECRET = defineString("SPREADSHEET_SECRET", { default: "METAGRI_HIMITSU_WORD_VOTE" });

// 実行リージョンを東京に設定
setGlobalOptions({ region: "asia-northeast1" });

/**
 * Firestoreの'votes'コレクションに新しい投票が作成された時のトリガー
 */
exports.recordVoteToSpreadsheet = onDocumentCreated("votes/{userId}", async (event) => {
  const startTime = Date.now();
  
  try {
    // イベントデータの検証
    const snap = event.data;
    if (!snap) {
      console.error("イベントデータが存在しません");
      return null;
    }

    const voteData = snap.data();
    const userId = event.params.userId;

    console.log(`投票処理開始: ユーザーID=${userId}, 投票先=${voteData.votedFor}`);

    // ユーザー情報の取得
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(userId);
    } catch (authError) {
      console.error("ユーザー情報取得失敗:", userId, authError);
      return null;
    }

    // データの検証とサニタイズ
    const postData = {
      secret: SPREADSHEET_SECRET.value(), // ★ .value()で環境変数の値を取得
      userId: userRecord.uid,
      userName: userRecord.displayName || "名前未設定",
      email: userRecord.email || "メール未設定",
      votedFor: voteData.votedFor
    };

    // 必須フィールドの検証
    if (!postData.userId || !postData.email || !postData.votedFor) {
      console.error("必須フィールドが不足:", postData);
      return null;
    }

    console.log("送信データ（合言葉含む）:", { ...postData, secret: "***隠匿***" });

    // GASへのHTTPSリクエスト送信
    const response = await sendToGoogleSheets(postData);
    
    const duration = Date.now() - startTime;
    console.log(`投票処理完了: ${duration}ms, レスポンス:`, response);

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`投票処理エラー: ${duration}ms,`, error);
    return null;
  }
});

/**
 * Google SheetsにデータをPOST送信する関数（合言葉認証付き）
 */
async function sendToGoogleSheets(postData) {
  return new Promise((resolve, reject) => {
    // GAS URLの検証
    const gasUrl = GAS_WEB_APP_URL.value();
    if (!gasUrl || gasUrl === "YOUR_GAS_WEB_APP_URL_HERE") {
      reject(new Error("GAS_WEB_APP_URL環境変数が設定されていません"));
      return;
    }

    // 合言葉の検証
    const secret = SPREADSHEET_SECRET.value();
    if (!postData.secret || postData.secret !== secret) {
      reject(new Error("セキュリティキーが正しくありません"));
      return;
    }

    const dataString = JSON.stringify(postData);
    const url = new URL(gasUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(dataString, "utf8"),
        "User-Agent": "Firebase-Functions-Secure/2.0"
      },
      timeout: 30000 // 30秒タイムアウト
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      
      res.on("end", () => {
        try {
          const responseData = JSON.parse(responseBody);
          
          if (res.statusCode === 200 && responseData.status === "success") {
            console.log("GAS送信成功:", responseData);
            resolve(responseData);
          } else {
            console.error("GAS送信失敗:", res.statusCode, responseData);
            reject(new Error(`GAS応答エラー: ${responseData.message || "不明なエラー"}`));
          }
        } catch (parseError) {
          console.error("GAS応答解析エラー:", parseError, "応答:", responseBody);
          reject(new Error("GAS応答の解析に失敗"));
        }
      });
    });

    req.on("error", (error) => {
      console.error("HTTPS リクエストエラー:", error);
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("GASリクエストがタイムアウトしました"));
    });

    // データ送信
    req.write(dataString, "utf8");
    req.end();
  });
}