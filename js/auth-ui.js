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

  function bind(id, handler){
    const el = $(id);
    if(el) el.onclick = handler;
  }

  function setupAuthUI(){
    if(!window.SP_FIREBASE){
      window.addEventListener('sp-firebase-ready', setupAuthUI, {once:true});
      return;
    }

    bind('btnSendCode', async function(){
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
    });

    bind('btnVerifyCode', async function(){
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
    });

    bind('btnAuthBack', function(){
      $('auth-code-step').style.display = 'none';
      $('auth-phone-step').style.display = 'block';
      $('authCode').value = '';
      clearErr();
    });

    bind('btnGoogle', async function(){
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
    });

    bind('btnShowEmail', function(){
      $('auth-email-step').style.display = 'block';
      this.style.display = 'none';
    });

    let emailMode = 'login';

    bind('btnEmailToggle', function(){
      const submit = $('btnEmailSubmit');
      if(emailMode === 'login'){
        emailMode = 'signup';
        if(submit) submit.textContent = 'Создать аккаунт';
        this.textContent = 'Уже есть аккаунт? Войти';
        $('authPass').setAttribute('autocomplete','new-password');
      } else {
        emailMode = 'login';
        if(submit) submit.textContent = 'Войти';
        this.textContent = 'Нет аккаунта? Создать';
        $('authPass').setAttribute('autocomplete','current-password');
      }
      clearErr();
    });

    bind('btnEmailSubmit', async function(){
      clearErr();
      const email = $('authEmail').value.trim();
      const pass = $('authPass').value;
      if(!email || !pass) return showErr('Введите email и пароль');
      if(emailMode === 'signup' && pass.length < 6) return showErr('Пароль минимум 6 символов');
      this.disabled = true;
      try{
        if(emailMode === 'signup'){
          await window.SP_FIREBASE.signupEmail(email, pass);
        } else {
          await window.SP_FIREBASE.loginEmail(email, pass);
        }
      }catch(e){
        let msg;
        if(emailMode === 'signup'){
          msg = e.code === 'auth/email-already-in-use' ? 'Email уже зарегистрирован'
            : e.code === 'auth/invalid-email' ? 'Некорректный email'
            : e.code === 'auth/weak-password' ? 'Слишком простой пароль (минимум 6 символов)'
            : 'Ошибка регистрации';
        } else {
          msg = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found'
            ? 'Неверный email или пароль' : 'Ошибка входа';
        }
        showErr(msg);
        this.disabled = false;
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setupAuthUI);
  } else {
    setupAuthUI();
  }
})();
