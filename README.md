# 🌾 AGRI VISION 2125 投票システム

[![Deploy to Firebase](https://github.com/YOUR_USERNAME/agri-vote-complete/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/agri-vote-complete/actions/workflows/deploy.yml)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-orange)](https://agri-vote-complete.web.app)
[![Firebase Functions](https://img.shields.io/badge/Firebase-Functions-yellow)](https://console.firebase.google.com/project/agri-vote-complete/functions)

## 📖 概要

AGRI VISION 2125の作品投票システムです。セキュアな1人1票制の投票機能と、リアルタイム集計、Googleスプレッドシート自動記録を実装しています。

## ✨ 主な機能

- 🔐 **Googleアカウント認証**（Firebase Authentication）
- 🗳️ **1人1票制投票システム**（重複投票防止）
- 📊 **リアルタイム集計表示**（Firestore リアルタイム同期）
- 📋 **スプレッドシート自動記録**（Firebase Functions + GAS連携）
- 🛡️ **包括的セキュリティ対策**（XSS対策、入力検証、合言葉認証）
- 🚀 **自動デプロイ**（GitHub Actions）

## 🏗️ 技術スタック

### フロントエンド
- **HTML5 + Vanilla JavaScript**（SPA構成）
- **Vite**（ビルドツール）
- **Firebase SDK**（認証・データベース）

### バックエンド
- **Firebase Firestore**（NoSQLデータベース）
- **Firebase Functions v2**（サーバーレス）
- **Firebase Authentication**（認証）
- **Firebase Hosting**（ホスティング）

### 外部連携
- **Google Apps Script**（スプレッドシート操作）
- **Google Sheets**（投票結果記録）

### 開発・デプロイ
- **GitHub Actions**（CI/CD）
- **ESLint + Prettier**（コード品質）
- **dotenv**（環境変数管理）

## 🚀 セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn
- Firebase CLI
- Googleアカウント

### ローカル開発環境構築

1. **リポジトリのクローン**
```bash
git clone https://github.com/YOUR_USERNAME/agri-vote-complete.git
cd agri-vote-complete
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
# .env.exampleを.envにコピー
cp .env.example .env

# .envファイルを編集して実際の値を設定
```

4. **Firebase プロジェクトの設定**
```bash
firebase login
firebase use agri-vote-complete
```

5. **開発サーバーの起動**
```bash
npm run dev
```

## 🔧 デプロイ

### 自動デプロイ（推奨）
- `main`ブランチにプッシュすると自動的にFirebase Hostingにデプロイされます
- プルリクエスト作成時はプレビュー環境が作成されます

### 手動デプロイ
```bash
# フロントエンドのみ
npm run deploy:hosting

# Functionsのみ  
npm run deploy:functions

# 全体
npm run deploy:all
```

## 🔒 セキュリティ

### 実装済みセキュリティ機能
- ✅ **認証必須制御**（未認証時は投票不可）
- ✅ **1人1票制限**（Firestore Rules + トランザクション）
- ✅ **XSS対策**（HTMLサニタイズ）
- ✅ **入力値検証**（フロント・バック両方）
- ✅ **合言葉認証**（Functions ↔ GAS間）
- ✅ **環境変数管理**（機密情報の分離）
- ✅ **セキュリティヘッダー**（XSS、Clickjacking対策）

### Firestore セキュリティルール
```javascript
// 投票データ：読み取りは全員、作成は認証済みユーザーのみ
match /votes/{userId} {
  allow read: if true;
  allow create: if request.auth != null 
                && request.auth.uid == userId
                && validateVoteData(request.resource.data);
  allow update, delete: if false;
}
```

## 📊 データ構造

### Firestore
```
votes/{userId}
├── votedFor: string     # 投票先作品ID
└── timestamp: timestamp # 投票日時
```

### Google Sheets
| 列 | フィールド | 例 |
|----|------------|-----|
| A | タイムスタンプ | 2024-07-10 14:30:25 |
| B | ユーザー名 | 山田太郎 |
| C | メールアドレス | taro@example.com |
| D | ユーザーID | abc123xyz |
| E | 投票作品ID | work1 |

## 🧪 テスト

### 機能テスト
```bash
# ローカルでの動作確認
npm run dev

# プロダクションビルドテスト
npm run build && npm run preview
```

### セキュリティテスト
- Firebase Console → Authentication でユーザー確認
- Firebase Console → Firestore でデータ確認  
- Google Sheets で記録確認
- Firebase Console → Functions でログ確認

## 📝 作品管理

作品の追加・変更は `index.html` の `worksData` 配列を編集：

```javascript
const worksData = [
  { 
    id: "work1",
    creator: "クリエイターA",
    title: "未来の畑",
    imageUrl: "https://example.com/image1.jpg"
  }
  // 新しい作品を追加...
];
```

## 📊 監視・運用

### ログ確認
```bash
# Firebase Functions ログ
firebase functions:log

# リアルタイムログ
firebase functions:log --only recordVoteToSpreadsheet
```

### 設定確認
```bash
# Firebase Functions環境変数
firebase functions:config:get

# ローカル環境変数
cat .env
```

## 🤝 貢献

1. フォークする
2. フィーチャーブランチを作成（`git checkout -b feature/AmazingFeature`）
3. 変更をコミット（`git commit -m 'Add some AmazingFeature'`）
4. ブランチにプッシュ（`git push origin feature/AmazingFeature`）
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🔗 関連リンク

- [🌐 本番環境](https://agri-vote-complete.web.app)
- [🔥 Firebase Console](https://console.firebase.google.com/project/agri-vote-complete)
- [📊 投票結果スプレッドシート](リンクは管理者のみ)
- [📋 要件定義書](docs/requirements.md)

## 👥 チーム

- **開発者**: Your Name
- **プロジェクト**: AGRI VISION 2125

---

### 🔧 トラブルシューティング

#### よくある問題

**Q: ログインできない**
A: Firebase Console → Authentication → Settings で承認済みドメインを確認

**Q: 投票データがスプレッドシートに記録されない**  
A: Firebase Functions ログで合言葉認証エラーがないか確認

**Q: GitHub Actionsでデプロイが失敗する**
A: Repository Secrets がすべて設定されているか確認

詳細は [トラブルシューティングガイド](docs/troubleshooting.md) を参照してください。