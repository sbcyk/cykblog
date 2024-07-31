if(PublicSacrificeDay()){
    document.getElementsByTagName("html")[0].setAttribute("style","filter:gray !important;filter:grayscale(100%);-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);");
  }
  
  function PublicSacrificeDay(){
      var PSFarr=new Array("0707","0909","0918","1109","1213");
      var currentdate = new Date();
      var str = "";
      var mm = currentdate.getMonth()+1;
      if(currentdate.getMonth()>9){
        str += mm;
      }else{
        str += "0" + mm;
      }
      if(currentdate.getDate()>9){
        str += currentdate.getDate();
      }else{
        str += "0" + currentdate.getDate();
      }
      if(PSFarr.indexOf(str)>-1){
          return 1;
      }else{
          return 0;
      }
  }

// 自动网站变灰
// 0707 - 七七事变
// 0909 - 毛主席忌辰
// 0918 - 九一八事变
// 1109 - 娣外公忌辰
// 1213 - 南京公祭日

let article;
const comment = {
    fetchData(options, type, exclude) {
        fetch('{envId}', {
            method: "POST",
            body: JSON.stringify({
                "event": "GET_RECENT_COMMENTS",
                "accessToken": "{YOUR_TOKEN}",
                "includeReply": true,
                ...options
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then(response => {
            let html = '',
				data = response.data;

			if (exclude) {
				switch (type) {
					case 'visitor':
						data = data.filter(item => item.mailMd5 === exclude);
						break;
					case 'v-shield':
						data = data.filter(item => item.mailMd5 !== exclude);
						break;
					case 'a-shield':
						data = data.filter(item => item.url !== exclude);
						break;
					default:
						break;
				}
			}
			
            data.forEach(item => {
                const createdDate = new Date(item.created);
                const formattedDate = `${createdDate.getFullYear().toString().slice(-2)}-${createdDate.getMonth() + 1}-${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}`;
                html += `<div class="comment-card">
                <div class="comment-info">
                    <img src="${item.avatar}" class="nolazyload">
                    <div class="comment-information">
                        <span class="${['亦封', '亦小封'].includes(item.nick) ? 'comment-author' : ''} comment-user" data-mailMd5="${item.mailMd5}">${item.nick}</span>
                        <span class="comment-time">${formattedDate}</span>
                    </div>
                </div>
                <div class="comment-content">${item.commentText.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div>
                <div class="comment-more">
                    <div class="comment-title">
                        <span class="comment-link" title="查看此文章" onclick="pjax.loadUrl('${item.url}')">
                            <i class="iconfont icat-read"></i>
                            ${article[item.url]}
                        </span>
                        <a onclick="pjax.loadUrl('${item.url}#${item.id}')">查看评论</a>
                    </div>
                    <div class="comment-tool">`
				
				let a = `<a href="javascript:void(0)" onclick="comment.article(event)" title="显示此文章所有评论">查看更多</a>`,
					b = `<a href="javascript:void(0)" onclick="comment.article(event, true)" title="不显示此文章的评论">屏蔽文章</a>`,
					c = `<a href="javascript:void(0)" onclick="comment.visitor(event, true)" title="不显示该访客的评论">屏蔽Ta</a>`,
					d = `<a href="javascript:void(0)" onclick="comment.visitor(event)" title="显示该访客的所有评论">查看Ta更多评论</a>`
					e = `<a href="javascript:void(0)" onclick="comment.data()" title="查看本站最新评论">返回评论</a>`;
				switch (type) {
					case 'article':
						html += e + c + d;
						break;
					case 'visitor':
						html += e + a + b;
						break;
					case 'v-shield':
					case 'a-shield':
						html += a + b + c + d + e;
						break;
					default:
						if (!type) html += a + b + c + d;
						break;
				}

				html += `</div>
					</div>
				</div>`
            });
            document.getElementById('comments-page').innerHTML = html;
        });
    },
	visitor(event, shield) {
        const spanElement = event.target.closest('.comment-card').querySelector('.comment-user');
        const mail = spanElement.getAttribute('data-mailMd5');
		if (shield) {
			this.fetchData({
				"pageSize": -1
			}, 'v-shield', mail);
			return
		}
		this.fetchData({
			"pageSize": -1
        }, 'visitor', mail);
    },
    article(event, shield) {
        const spanElement = event.target.closest('.comment-card').querySelector('.comment-link');
        const url = spanElement.getAttribute('onclick').match(/'(\/.*?)'/)[1];
		if (shield) {
			this.fetchData({
				"pageSize": -1
			}, 'a-shield', url);
			return
		}
        this.fetchData({
            "urls": [url]
        }, 'article');
    },
    data() {
        if (!article) fetch('/article.json').then(res => res.json()).then(data => { article = data; });
        this.fetchData({
            "pageSize": 100
        });
    }
};

window.DOMReady = function () {
	if (document.querySelector('#comments-page')) comment.data();
};

window.addEventListener("load", DOMReady)
document.addEventListener("pjax:complete", DOMReady)

// 最新评论页
