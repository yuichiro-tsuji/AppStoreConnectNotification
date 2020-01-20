# 概要
アプリの審査状況をSlackに通知するGASです

# 使用方法
 1. 通知を送りたいチャンネル(DM)に、カスタムインテグレーションからIncoming Webhookを追加
 2. スクリプトをclone
 3. cloneしたスクリプト(AppStoreConnectNoticifation.gs)の2,4,6行目の変数にそれぞれ、追加したWebhookのURL, Appleからのメールを受け取るアドレス, 通知を送りたいアプリの名前 を記入する
 4. 定期実行(5分毎など)の設定をして終了!
