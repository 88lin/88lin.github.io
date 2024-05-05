async function confirm() {
  const chatInput = document.getElementsByClassName('chat-input')[0];
  const chatBotBox = document.getElementsByClassName('chatbot-box')[0];

  // 检查输入框是否为空
  if (chatInput.value.trim() === '') {
    chatBotBox.innerHTML = '请输入一些内容！';
    return;
  }

  try {
    // 发送请求到API
    const response = await fetch(`https://api.lolimi.cn/API/AI/gemini.php?msg=${encodeURIComponent(chatInput.value)}`);
    const data = await response.json();

    if (data.code === 200 && data.data.output) {
      // 使用API返回的文本更新聊天机器人的回复
      chatBotBox.innerHTML = data.data.output;
    } else {
      // 如果API没有返回有效的输出，显示默认消息
      chatBotBox.innerHTML = '我还没学过呢。教教我!';
    }

    // 清空输入框
    chatInput.value = '';

    // 如果存在图片，隐藏它
    const chatbotImage = document.getElementsByClassName('chatbot-image')[0];
    chatbotImage.style.visibility = 'visible';

  } catch (error) {
    console.error('Error fetching data from API:', error);
    chatBotBox.innerHTML = '哎呀，出错了，请再试一次。';
  }
}
document.getElementsByClassName('chat-input')[0].addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // 阻止回车键的默认行为
    confirm(); // 调用发送函数
  }
});