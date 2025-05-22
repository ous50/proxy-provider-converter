import axios from "axios";

export default async function handler(req, res) {
    const requestPath = req.url.split('?')[0];
    const urlQueryParam = req.query.url;
    const subNameQueryParam = req.query.subName ? req.query.subName : null;

    if (requestPath.endsWith(".sgmodule")) {
        let subName;
        if (subNameQueryParam) {
            subName = subNameQueryParam;
        } else if (urlQueryParam) {
            subName = urlQueryParam.split("/")[2]?.split(".")[0] || requestPath.replace(/\.sgmodule$/, '').split('/').pop();
        } else {
            subName = requestPath.replace(/\.sgmodule$/, '').split('/').pop() || "defaultModule";
        }

        // Constructing the absolute script-path:
        const protocol = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
        const host = req.headers['x-forwarded-host'] || req.headers.host;

        // The script-path should be the URL that was requested, but without the .sgmodule suffix.
        // If request was https://domain.com/api/subinfo.sgmodule?url=http://example.com/sub
        // scriptPath should be https://domain.com/api/subinfo?url=http://example.com/sub (preserving query params if needed by the script itself)
        // Or, if the script is *always* just the base path without .sgmodule and without original query params:
        const scriptPathBase = requestPath.replace(/\.sgmodule$/, ""); // e.g., /api/subinfo
        let scriptPath = `${protocol}://${host}${scriptPathBase}?url=${urlQueryParam}`;
        if (subNameQueryParam) {
            scriptPath += `&subName=${subNameQueryParam}`;
        }


        const title = subName || urlQueryParam || `${protocol}://${host}${requestPath}`;
        const sgmoduleStr = `#!name=${title} 订阅信息
#!desc=显示${title}剩余流量信息以及套餐到期日期
#!category=Subscription Info
#!author=ous50

[Panel]
${subName}-Panel = script-name=${subName}-Script, title="${title} 订阅信息", update-interval=43200

[Script]
${subName}-Script = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/getsomecat/GetSomeCats/Surge/modules/Panel/Sub-info/Moore/Sub-info.js,script-update-interval=0,argument=url=encode后的机场节点链接&reset_day=1&title=你机场名字&icon=externaldrive.fill.badge.icloud=#007aff
`;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(200).send(sgmoduleStr);
        return;
    }

    res.status(404).send("Request path does not end with .sgmodule or other handler not implemented.");
}
