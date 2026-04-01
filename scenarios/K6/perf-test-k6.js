import http from 'k6/http';

var url = "https://forms-runner.dev.cdp-int.defra.cloud/form/jn-new-form-for-audit-timeline"  // redirected to https
export default function () {
    var res;
    res = http.get(url);
    console.log(res.status_text);  // prints "200 OK"
    res = http.get(url, { redirects: 0 });
    console.log(res.status_text);  // prints "308 Permanent Redirect"
    console.log(res.headers['Location']);

}