(function(){
  function $(id){return document.getElementById(id)}
  function showErr(msg){const e=$('authError');if(!e)return;e.textContent=msg;e.style.display='block';setTimeout(()=>{e.style.display='none'},6000)}
  function clearErr(){const e=$('authError');if(e)e.style.display='none'}

  function normalizeKzPhone(raw){
    let p = raw.replace(/[^\d+]/g,'');
    if(p.startsWith('+')) return p;
    if(p.startsWith('8')) p = '7'+p.slice(1);
    if(!p.startsWith('7')) p = '7'+p;
    return '+'+p;
  }

  function setupAuthUI(){
    if(!window.SP_FIREBASE){
      window.addEventListener('sp-firebase-ready', setupAuthUI, {once:true});
      return;
    }

    const btnSendCode = $('btnSendCode');
    if(!btnSendCode) return;

    btnSendCode.onclick = async function(){
      clearErr();
      const raw = $('authPhone').value.trim();
      if(!raw) return showErr('Введите номер телефона');
      const phone = normalizeKzPhone(raw);
      if(phone.length < 11) return showErr('Похоже, номер неполный');
      this.disabled = true;
      const orig = this.textContent;
      this.textContent = 'ОТПРАВЛЯЕМ...';
      try{
        await window.SP_FIREBASE.sendPhoneCode(phone);
        $('auth-phone-step').style.display = 'none';
        $('auth-code-step').style.display = 'block';
        $('authPhoneShown').textContent = phone;
        $('authCode').focus();
      }catch(e){
        showErr('Не удалось отправить SMS: '+(e.code||e.message||'попробуйте позже'));
      }
      this.disabled = false;
      this.textContent = orig;
    };

    $('btnVerifyCode').onclick = async function(){
      clearErr();
      const code = $('authCode').value.trim();
      if(!/^\d{6}$/.test(code)) return showErr('Введите 6-значный код');
      this.disabled = true;
      const orig = this.textContent;
      this.textContent = 'ПРОВЕРЯЕМ...';
      try{
        await window.SP_FIREBASE.verifyPhoneCode(code);
      }catch(e){
        showErr('Неверный код');
        this.disabled = false;
        this.textContent = orig;
      }
    };

    $('btnAuthBack').onclick = function(){
      $('auth-code-step').style.display = 'none';
      $('auth-phone-step').style.display = 'block';
      $('authCode').value = '';
      clearErr();
    };

    $('btnGoogle').onclick = async function(){
      clearErr();
      this.disabled = true;
      try{
        await window.SP_FIREBASE.loginGoogle();
      }catch(e){
        if(e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request'){
          showErr('Ошибка входа через Google');
        }
        this.disabled = false;
      }
    };

    $('btnShowEmail').onclick = function(){
      $('auth-email-step').style.display = 'block';
      this.style.display = 'none';
    };

    $('btnEmailLogin').onclick = async function(){
      clearErr();
      const email = $('authEmail').value.trim();
      const pass = $('authPass').value;
      if(!email || !pass) return showErr('Введите email и пароль');
      this.disabled = true;
      try{
        await window.SP_FIREBASE.loginEmail(email, pass);
      }catch(e){
        const msg = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found'
          ? 'Неверный email или пароль' : 'Ошибка входа';
        showErr(msg);
        this.disabled = false;
      }
    };

    $('btnEmailSignup').onclick = async function(){
      clearErr();
      const email = $('authEmail').value.trim();
      const pass = $('authPass').value;
      if(!email || !pass) return showErr('Введите email и пароль');
      if(pass.length < 6) return showErr('Пароль минимум 6 символов');
      this.disabled = true;
      try{
        await window.SP_FIREBASE.signupEmail(email, pass);
      }catch(e){
        const msg = e.code === 'auth/email-already-in-use' ? 'Email уже зарегистрирован'
          : e.code === 'auth/invalid-email' ? 'Некорректный email'
          : 'Ошибка регистрации';
        showErr(msg);
        this.disabled = false;
      }
    };
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setupAuthUI);
  } else {
    setupAuthUI();
  }
})();
