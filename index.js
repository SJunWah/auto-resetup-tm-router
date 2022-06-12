
const fs = require('fs');
var filename = 'include/config.json';
var contents = fs.readFileSync(filename);
var jsonContent = JSON.parse(contents);

const Nightmare = require("nightmare");
require('nightmare-iframe-manager')(Nightmare);

var nightmare = Nightmare({
    show: true, dock: true,
    webPreferences: {
        webSecurity: false
    }
})

const url = jsonContent.url;
const modemUsrname = jsonContent.modemUsrname;
const modemPwd = jsonContent.modemPwd;
const tmUsrname = jsonContent.tmUsrname;
const tmPwd = jsonContent.tmPwd;
const wifi2p4GhzName = jsonContent.wifi2p4GhzName;
const wifi2p4GhzPwd = jsonContent.wifi2p4GhzPwd;
const wifi5p0GhzName = jsonContent.wifi5p0GhzName;
const wifi5p0GhzPwd = jsonContent.wifi5p0GhzPwd;

nightmare
    .goto(url)
    .header(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    )
    .viewport(1920, 1080)
    .wait(2000)
    .evaluate(function () {
        if ((document.querySelector("input[name=save]"))) {
            document.querySelector("input[name=save]").click();
        }
    })
    .wait(2000)
    .end()
    .insert("#username", modemUsrname)
    .insert("#password", modemPwd)
    // .click("#loginBtn")
    .evaluate(function () {
        document.querySelector('input[name=save]').click();
    })
    .wait(2000)
    .click("#nav>li:nth-child(2)>a")
    .wait(2000)
    .enterIFrame('#contentIframe')
    .insert('input[name=username]', tmUsrname)
    .insert('input[name=password]', tmPwd)
    .insert("input[name=ssid_0]", wifi2p4GhzName)
    .insert("input[name=ssid_1]", wifi5p0GhzName)
    .select("#enctyption_0", "6")
    .select("#enctyption_1", "6")
    .type("input[name=key_0]", wifi2p4GhzPwd)
    .type("input[name=key_1]", wifi5p0GhzPwd)
    .click("input[name=save]")
    .wait(5000)
    //   .wait(".main-select .text-tab:nth-child(2) a")
    //   .html(path.resolve(__dirname, "./outfile"))
    // .evaluate(function () {
    //     var list = (document.querySelectorAll('li'));
    //     list[2].click();
    //     return list[2].innerText;
    //     // var select = document.querySelector("#nav>li:nth-child(3)");
    //     // select.click();
    //     // return select.innerText;
    // })
    // .evaluate(function () {
    //    (document.querySelector("#contentIframe").contentWindow.document.querySelector("#ppp0").click());
    // })
    // })
    // .click("#nav>li:nth-child(3)>a")
    .end(() => console.log("Success!"))
    // .then((r) => {
    //     console.log(r);
    // })
    .catch((error) => {
        console.error("Search failed:", error);
    });
// }