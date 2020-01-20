// SlackのWebhook URL
var slackUrl = "https://hooks.slack.com/WEBHOOK_URL"
// Appleからのメールを受け取るアドレス
var selfAddress = "your-email@excite.jp";
// 通知を送りたいアプリの名前
var appName = "YOUR APP NAME"

var defaultPayload = {
  "username": "AppStore Connect",
  "text": "アプリのステータスに変更がありました",
  "icon_emoji": ":apple:"
};

function clone(obj) { 
  if (null == obj || "object" != typeof obj) return obj; 
  var copy = obj.constructor(); 
  for (var attr in obj) { 
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]; 
  } 
  return copy; 
}

function getAttachment(subject) {
  var statuses = [
    {
      "token": "Prepare for Upload",
      "text": ":man_in_lotus_position: App Storeへのアップロード準備中です",
      "color": "#00BBAA"
    },
    {
      "token": "Processing for App Store",
      "text": ":globe_with_meridians: App Storeへのアップロードを実行中です...",
      "color": "#00BBAA"
    },
    {
      "token": "Waiting For Review",
      "text": ":hourglass_flowing_sand: アップロードが完了しました。レビュー待ちです",
      "color": "#00BBAA"
    },
    {
      "token": "Developer Rejected",
      "text": ":man-gesturing-no: アプリの申請を取り下げました",
      "color": "#FFBB44"
    },
    {
      "token": "In Review",
      "text": ":mag: レビューに入りました",
      "color": "#FFBB44"
    },
    {
      "token": "New message from App Review",
      "text": ":warning: レビューアプリに対して、Appleより連絡がありました",
      "color": "#FFBB44"
    },
    {
      "token": "Pending Developer Release",
      "text": ":100: レビューが通りました",
      "color": "#00BBAA"
    },
    {
      "token": "Ready for Sale",
      "text": ":tada: 公開処理が完了しました！ 反映までしばらくお待ちください",
      "color": "#00BBAA"
    },
  ];
  
  for (var status in statuses) {
    if (~subject.indexOf(statuses[status].token)) {
      return statuses[status];
    }
  }

  return null;
}

function checkAppName(message) {
  var title = message.getSubject();
  var regexp = new RegExp(appName);

  return (title.match(regexp) != null) ? true : false;
}

function makePayload(message) {
  var payload = clone(defaultPayload);
  
  var attachment = getAttachment(message.getSubject());
  if (!attachment) {
    return null
  }
  
  payload["attachments"] = [attachment];
  return payload;
}

function postSlack(payload) {
  var payloadStr = JSON.stringify(payload);
  var escapedStr = payloadStr.replace(/":"/g, "\"\:\"");
  Logger.log(escapedStr);
  
  var options = {
    'method': 'post',
    'contentType': 'Content-type: application/json; charset=utf-8',
    'payload': escapedStr
  }
  
  var response = UrlFetchApp.fetch(slackUrl, options) || false;

  var ret = true;
  if (!response || response.getResponseCode() != 200) {
    ret = false;
  }
  return {status: ret, code: response.getResponseCode(), response: response};
}

function postError(message) {
  GmailApp.sendEmail(selfAddress, "Slackへのポストに失敗しました", "スクリプトを確認してください。失敗メールの件名：" + message.getSubject());
}

function main() {
  var threads = GmailApp.search('from:no_reply@email.apple.com');
  var messages = GmailApp.getMessagesForThreads(threads);
  
  for (var i in messages) {
    for (var j in messages[i]) {
      var message = messages[i][j];
      if (!message || !checkAppName(message) || !message.isUnread()) {
        continue;
      }
      
      var payload = makePayload(message);
      if (!payload) {
        continue;
      }
      
      res = postSlack(payload);
      if (!res.status) {
        postError(message);
        continue;
      }
      
      message.markRead();
    } 
  }
}