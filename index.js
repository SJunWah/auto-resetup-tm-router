
const axios = require('axios');
const qs = require('qs');
const wifi = require('node-wifi');
const fs = require('fs');
var filename = 'include/config.json';
var contents = fs.readFileSync(filename);
var jsonContent = JSON.parse(contents);

const url = jsonContent.url;
const modemUsrname = jsonContent.modemUsrname;
const modemPwd = jsonContent.modemPwd;
const tmUsrname = jsonContent.tmUsrname;
const tmPwd = jsonContent.tmPwd;
const wifi2p4GhzName = jsonContent.wifi2p4GhzName;
const wifi2p4GhzPwd = jsonContent.wifi2p4GhzPwd;
const wifi5p0GhzName = jsonContent.wifi5p0GhzName;
const wifi5p0GhzPwd = jsonContent.wifi5p0GhzPwd;


wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});

async function checkConnection() {
  let checkConnectionConfig = {
    method: 'get',
    url: 'https://ipapi.co/8.8.8.8/json/',
  };
  try {
    const checkConnectionResponse = await axios(checkConnectionConfig);
    if (checkConnectionResponse.status === 200)
      return true;
    else
      return false;
  } catch (error) {
    return false;
  }
}

async function connectWifi() {
  const wifiList = [{ usrname: `${wifi5p0GhzName}@unifi`, pwd: wifi5p0GhzPwd }, { usrname: `${wifi2p4GhzName}@unifi`, pwd: wifi2p4GhzPwd }];
  for (var index in wifiList) {
    console.log(wifiList[index])
    wifi.connect({ ssid: `${wifiList[index].usrname}`, password: wifiList[index].pwd }, () => {
      console.log(`Connecting to ${wifiList[index].usrname}`);
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    const cWifi = await wifi.getCurrentConnections();
    if (cWifi.length > 0) {
      if (([`${wifiList[index].usrname}`]).includes(cWifi[0].mac)) {
        console.log(`Connected to ${wifiList[index].usrname}`);
        return true
      }
    }
  }
  return false;
}

async function setupWifi() {
  let loginData = qs.stringify({
    'username': modemUsrname,
    'password': modemPwd,
    'save': 'Login',
    'submit-url': '/admin/login.asp'
  });

  let loginConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${url}/boaform/admin/formLogin`,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ms;q=0.6',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'DNT': '1',
      'Origin': `${url}`,
      'Pragma': 'no-cache',
      'Referer': `${url}/admin/login.asp`,
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
    data: loginData
  };

  let setupData = qs.stringify({
    'ptm_config': '3',
    'username': tmUsrname,
    'password': tmPwd,
    'enablewireless_0': 'ON',
    'enablewireless_1': 'ON',
    'ssid_0': wifi2p4GhzName,
    'ssid_1': wifi5p0GhzName,
    'encryption_0': '4',
    'encryption_1': '4',
    'key_0': wifi2p4GhzPwd,
    'key_1': wifi5p0GhzPwd,
    'port1_number': '@ims.tm.com.my',
    'port1_password': '',
    'port2_number': '@ims.tm.com.my',
    'port2_password': '',
    'save': 'Apply+Changes',
    'submit-url': '/admin/fastconf.asp',
    'itfGroup': '0'
  });

  let setupConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${url}/boaform/admin/formFastConf`,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ms;q=0.6',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'DNT': '1',
      'Origin': `${url}`,
      'Pragma': 'no-cache',
      'Referer': `${url}/fastconf.asp?v=1687676051000`,
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
    data: setupData
  };
  try {
    const loginResponse = await axios(loginConfig);
    if (loginResponse.status === 200) {
      const setupResponse = await axios(setupConfig);
      if (setupResponse.status === 200) {
        console.log('Setup successful')
        return true;
      } else {
        console.log("Setup failed");
        throw new Error(false)
      }
    } else {
      console.log("Login failed");
      throw new Error(false)
    }
  } catch (error) {
    return error
  }
}

async function init() {
  try {
    const cWifi = await wifi.getCurrentConnections();
    console.log(cWifi);
    if (cWifi.length > 0) {
      console.log('Wifi connected');
      if (([`${wifi2p4GhzName}@unifi`, `${wifi5p0GhzName}@unifi`]).includes(cWifi[0].mac)) {
        console.log('Wifi connected to correct network');
      }
    }
    else {
      console.log('Wifi not connected');
      await connectWifi();
    }
    const checkConnectionResponse = await checkConnection();
    if (checkConnectionResponse)
      console.log('Internet connection available');
    else {
      console.log('No internet connection');
      const setupWifiResponse = await setupWifi();
      if (setupWifiResponse) {
        console.log('Setup successful');
      }
    }
  } catch (error) {
    console.error(error)
  }
}
init();
