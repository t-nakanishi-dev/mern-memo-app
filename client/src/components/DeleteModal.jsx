// client/src/components/DeleteModal.jsx
import React from "react";

/**
 * DeleteModalコンポーネント
 * -------------------------
 * 削除確認用のモーダルウィンドウ
 *
 * Props:
 * - isOpen: boolean - モーダルを表示するかどうか
 * - onConfirm: function - 「削除する」ボタンを押したときの処理
 * - onCancel: function - 「キャンセル」ボタンを押したときの処理
 */
const DeleteModal = ({ isOpen, onConfirm, onCancel }) => {
  // モーダルが開いていなければ何も表示しない
  if (!isOpen) return null;

  return (
    // 背景を半透明にして中央にモーダルを表示
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
        {/* モーダルタイトル */}
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          本当に削除しますか？
        </h2>
        {/* モーダル補足メッセージ */}
        <p className="text-gray-600 mb-6 text-sm">この操作は元に戻せません。</p>

        {/* ボタン配置 */}
        <div className="flex justify-center gap-4">
          {/* 削除実行ボタン */}
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            削除する
          </button>

          {/* キャンセルボタン */}
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
