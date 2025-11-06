📒 Memo App – シンプルなメモ管理アプリ

🔗 デプロイURL
https://memo-app.onrender.com
※スマートフォン・PCの両方に対応しています。

🔑 ログイン情報  
テストユーザーでログインできます。  
- **Email**: test@gmail.com  
- **Password**: test

📸 スクリーンショット
PC画面

<img width="545" alt="メモ作成" src="https://github.com/user-attachments/assets/374678ef-9ac7-49e6-b464-4914c876415d" />
<img width="418" alt="メモ一覧" src="https://github.com/user-attachments/assets/8b918c44-6a74-42bd-ad4f-2cb281ee32ec" />

スマホ画面

📝 アプリの概要
このアプリは、ユーザーが自分のメモを作成・編集・分類・管理できるシンプルなメモ管理ツールです。
カテゴリ分け・検索・アーカイブなど、使いやすさと整理性を重視しています。

🔧 使用技術
フロントエンド: React, Tailwind CSS, Axios, React Router
バックエンド: Node.js, Express
データベース: MongoDB (Mongoose)
ホスティング: Render, GitHub Pages
その他: Firebase（画像アップロード機能）

### ✨ 主な機能
- 📄 **メモ作成・編集・削除**：タイトル・本文・画像を含むメモを自由に管理
- 🔍 **検索機能**：タイトルでのリアルタイム検索
- 🏷 **カテゴリ機能**：カテゴリで分類し、絞り込み可能
- 🗂 **アーカイブ / ゴミ箱機能**：不要なメモを一時的に非表示・復元
- 🖼 **画像アップロード**：Firebaseを使った画像添付
- 📱 **レスポンシブ対応**：モバイル・PC両対応

💡 工夫した点・学んだこと
状態管理：useState / useEffect など React のフックを活用して効率的な状態管理を実現
データ設計：カテゴリ・アーカイブ・画像アップロードなどに対応したスキーマ構成を設計
エラー対応：画像アップロード機能では非同期処理やバリデーションの重要性を体感
UI/UX：モバイル対応を意識した設計、余白やフォントサイズの調整など視認性を工夫
英語コメント：すべてのコードに英語コメントを追加し、読みやすさを向上

🚀 今後追加予定の機能
- 📅 カレンダー表示：メモを日付ベースで管理
- ⏰ リマインダー機能：指定日時に通知（ToDoにも応用可）
- 🌐 多言語対応：UIを日本語／英語で切り替え可能
 
👤 作者情報
名前：PiyoCode324
GitHub：https://github.com/PiyoCode324

📦 セットアップ方法（任意）

```bash
# クローン
git clone https://github.com/PiyoCode324/memo-app.git

# サーバー側
cd server
npm install
npm run dev

# クライアント側
cd client
npm install
npm start
```

📝 ライセンス
MIT
