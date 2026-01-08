先在lucky里设置好，web服务和动态域名（很简单略过），然后再在lucky里添加STUN穿透规则如下，

注明一点，宽带必须是NAT1也就是Full Cone NAT，如果不是就不用搞了。据说NAT2,3也行，我没试成功。

点击STUN内网穿透->添加穿透规则来添加一条stun端口，按照下列规则填写（如图）
```
规则名称:****（自己随便填）
穿透通道本地端口:60000（随便填没用过的就行）
防火墙自动放行 必须
upnp:打开 非必须看lucky安装在哪里，安装在路由器上可以不用打开
目标地址:127.0.0.1  （自己需要访问应用的地址）
目标端口:16666  （自己需要访问应用的端口）
```
![](/blogs/10/0ab74ea54161a4f2.png)
添加后你会得到一个动态公网IP+动态端口号，这个IP+端口号就可以通过互联网直接访问到了
![](/blogs/10/27c03cc804a2e11a.png)
如果你的lucky的web反代服务和动态IP已经设置好了。那你现在就可以用域名+STUN穿透的端口号就可以访问应用了，但是那个端口号是动态的一段时间就会变。想不用换端口号访问就要用到Cloudflare+CDN优选+workers这个了。

先到Cloudflare绑定一个域名。拿到域名API。这些就不详说了。很简单。

在cloudflare的域名dns管理页面，添加一个CNAME的cloudflare优选域名，这里使用的优选域名为cf.090227.xyz，大家也可以使用其他的优选域名。
![](/blogs/10/d98c8698c2da9102.png)
在cloudflare的侧边栏->workers路由->管理workers->创建->创建workers来创建一个workers

名称填redirect，点击部署，完成后点击编辑代码。

粘贴下列代码块并修改配置参数，主要修改你的域名、ddns域名和端口号。端口号填写上面在lucky创建的stun穿透后的端口号，最后点击部署
```
// 配置参数
const CONFIG = {
    // 需要重定向的域名
    sourceDomain: 'cloudfare域名',
    // 重定向后的域名
    targetDomain: 'lucky域名',
    // 目标端口号
    targetPort: 'stun端口'
  };
  
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const hostname = url.hostname;
  
    // 只要 hostname 中包含 sourceDomain，就将 sourceDomain 替换为 targetDomain，并指定 port
    if (hostname.includes(CONFIG.sourceDomain)) {
      const newHost = hostname.replace(CONFIG.sourceDomain, CONFIG.targetDomain);
      const targetUrl = `https://${newHost}:${CONFIG.targetPort}${url.pathname}${url.search}`;
  
      // 返回 302 临时重定向，如果有需要，可以改成 307 重定向
      return Response.redirect(targetUrl, 302);
    }
    // 如果不是目标域名，则返回 404
    return new Response('Not Found', { status: 404 });
  }
```
这样就完成了对workers的部署

在设置栏添加一个路由，把*.cloudflare域名/*进行路由，这样就可以将*.cloudflare域名/*的全部http请求交给workers-redirect来处理，进行js重定向操作

现在可以在浏览器输入www.cloudflare域名来进行测试，可以重定向到https://www.lucky域名:stun端口。
动态更新stun端口号==(重点)==
回到lucky->STUN内网穿透->编辑之前创建的stun穿透规则，点击Webhook，依次填写下列参数：
```
接口地址：https://api.cloudflare.com/client/v4/accounts/账户ID/workers/scripts/redirect
请求方法：PUT
请求头：
Authorization: Bearer workers的API密钥
Content-Type: application/javascript
接口调用成功包含的字符串："success": true
请求体：
```
```
// 配置参数
const CONFIG = {
    // 需要重定向的域名
    sourceDomain: 'cloudfare域名',
    // 重定向后的域名
    targetDomain: 'lucky域名',
    // 目标端口号
    targetPort: '#{port}'
  };
  
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const hostname = url.hostname;
  
    // 只要 hostname 中包含 sourceDomain，就将 sourceDomain 替换为 targetDomain，并指定 port
    if (hostname.includes(CONFIG.sourceDomain)) {
      const newHost = hostname.replace(CONFIG.sourceDomain, CONFIG.targetDomain);
      const targetUrl = `https://${newHost}:${CONFIG.targetPort}${url.pathname}${url.search}`;
  
      // 返回 302 临时重定向，如果有需要，可以改成 307 重定向
      return Response.redirect(targetUrl, 302);
    }
    // 如果不是目标域名，则返回 404
    return new Response('Not Found', { status: 404 });
  }
```
在这里说明一下,Webhook是一个用来实现当stun穿透的端口号发生变化的时候会自动执行http请求，实现动态更新端口号。请求头内的#{port}是lucky的变量，代表当前stun穿透的端口号。

填写完成后先点击Webhook手动触发测试，测试一下。
![](/blogs/10/9e8619c26efa5fb3.png)
如果发现存在"success": true字眼就说明可以正常更新了，这样就实现了动态更新stun穿透的公网端口

再就可以用cloudfare域名的域名访问lucky的域名加stun端口了。给域名申请个证书就实现HTTPS

完毕 转自FishTca博客
