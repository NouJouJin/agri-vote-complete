import { defineConfig } from 'vite';

export default defineConfig({
  // ビルド設定
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 本番では無効化（セキュリティ）
    minify: 'terser', // より良い圧縮
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    },
    // ファイルサイズ警告の閾値
    chunkSizeWarningLimit: 1000
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    host: 'localhost',
    open: true, // 自動でブラウザを開く
    cors: true
  },
  
  // プレビュー設定（ビルド後のテスト用）
  preview: {
    port: 4173,
    host: 'localhost',
    open: true
  },

  // 環境変数の設定
  define: {
    // 開発環境での追加設定（必要に応じて）
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },

  // CSS設定
  css: {
    devSourcemap: true // 開発時のCSS source map
  }
});