/* ACHAJA 공유·메일 발송 헬퍼
   Web Share API + clipboard + 카카오/X/Facebook deep links + Resend(또는 mailto fallback)
   결과 페이지(/history)와 미리보기 페이지(/preview/free, /preview)에서 공통 사용. */
(function (global) {
  'use strict';

  var DEFAULT_TITLE = 'ACHAJA — 중고차 이력 무료 조회 결과';
  var SITE_URL = 'https://achaja.net';

  /* ──────────────────────────────────────────────────
     공유 — Web Share API + 클립보드 + 외부 SNS deep link
     ────────────────────────────────────────────────── */
  function shareResult(opts) {
    opts = opts || {};
    var title = opts.title || DEFAULT_TITLE;
    var text  = opts.text  || '';
    var url   = opts.url   || location.href;

    // 1) Web Share API (모바일 우선) — 안 되면 폴백
    if (navigator.share) {
      return navigator.share({ title: title, text: text, url: url })
        .then(function(){ })
        .catch(function(err){ console.warn('Web Share cancelled', err); });
    }

    // 2) 폴백: 공유 메뉴 (모달/시트) 열기
    openShareSheet({ title: title, text: text, url: url });
    return Promise.resolve();
  }

  function openShareSheet(ctx) {
    // 기존 시트 제거
    var existing = document.getElementById('achaja-share-sheet');
    if (existing) existing.remove();

    var encodedUrl = encodeURIComponent(ctx.url);
    var encodedText = encodeURIComponent(ctx.text + '\n' + ctx.url);
    var encodedTitle = encodeURIComponent(ctx.title);

    var sheet = document.createElement('div');
    sheet.id = 'achaja-share-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', '결과 공유');
    sheet.innerHTML =
      '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center;" id="ach-share-backdrop">' +
        '<div style="background:rgb(var(--c-surface,255 255 255));border-radius:24px 24px 0 0;width:100%;max-width:500px;padding:24px 20px 32px;box-shadow:0 -4px 20px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">' +
          '<div style="text-align:center;margin-bottom:16px;"><div style="width:40px;height:4px;background:rgb(var(--c-outline-variant,200 200 200));border-radius:2px;margin:0 auto 12px;"></div><h3 style="font-family:Manrope,sans-serif;font-size:16px;font-weight:700;color:rgb(var(--c-on-surface,0 0 0));margin:0;">결과 공유하기</h3></div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">' +
            // KakaoTalk
            '<a href="javascript:void(0);" onclick="window.AchajaShare._kakao(' + JSON.stringify(ctx).replace(/"/g,'&quot;') + ');return false;" style="display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:rgb(var(--c-on-surface,0 0 0));">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:#FEE500;display:flex;align-items:center;justify-content:center;font-size:24px;">💬</div><span style="font-size:11px;">카카오톡</span></a>' +
            // X (Twitter)
            '<a href="https://twitter.com/intent/tweet?text=' + encodedText + '" target="_blank" rel="noopener" style="display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:rgb(var(--c-on-surface,0 0 0));">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:bold;">𝕏</div><span style="font-size:11px;">X (Twitter)</span></a>' +
            // Facebook
            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '" target="_blank" rel="noopener" style="display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:rgb(var(--c-on-surface,0 0 0));">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:#1877F2;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:bold;">f</div><span style="font-size:11px;">Facebook</span></a>' +
            // 링크 복사
            '<a href="javascript:void(0);" onclick="window.AchajaShare._copyLink(' + JSON.stringify(ctx).replace(/"/g,'&quot;') + ');return false;" style="display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:rgb(var(--c-on-surface,0 0 0));">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:rgb(var(--c-primary-container,13 71 161));display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">🔗</div><span style="font-size:11px;">링크 복사</span></a>' +
          '</div>' +
          // URL preview
          '<div style="padding:10px 12px;background:rgb(var(--c-surface-container-low,243 244 245));border-radius:8px;font-family:monospace;font-size:11px;color:rgb(var(--c-on-surface-variant,75 85 99));word-break:break-all;margin-bottom:12px;">' + ctx.url + '</div>' +
          '<button onclick="document.getElementById(\'achaja-share-sheet\').remove();" style="width:100%;padding:12px;background:rgb(var(--c-surface-container,237 238 239));border:none;border-radius:12px;font-size:14px;font-weight:600;color:rgb(var(--c-on-surface,0 0 0));cursor:pointer;">닫기</button>' +
        '</div>' +
      '</div>';

    sheet.querySelector('#ach-share-backdrop').addEventListener('click', function(){ sheet.remove(); });
    document.body.appendChild(sheet);
  }

  function _copyLink(ctx) {
    var text = (ctx.text ? ctx.text + '\n' : '') + ctx.url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function(){
        showToast('링크가 복사되었습니다');
      });
    } else {
      // Legacy fallback
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showToast('링크가 복사되었습니다'); } catch(e){}
      document.body.removeChild(ta);
    }
    var sheet = document.getElementById('achaja-share-sheet');
    if (sheet) setTimeout(function(){ sheet.remove(); }, 600);
  }

  function _kakao(ctx) {
    // 카카오 SDK가 로드된 경우
    if (window.Kakao && window.Kakao.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: ctx.title,
          description: ctx.text || '중고차 사고·리콜 무료 조회 — ACHAJA',
          imageUrl: SITE_URL + '/og-image.png',
          link: { mobileWebUrl: ctx.url, webUrl: ctx.url }
        }
      });
    } else {
      // SDK 미로드 시: 카카오톡 share URL 폴백 (모바일 카카오톡 앱 호출)
      var url = 'https://story.kakao.com/share?url=' + encodeURIComponent(ctx.url) + '&text=' + encodeURIComponent(ctx.text || '');
      window.open(url, '_blank', 'noopener');
    }
    var sheet = document.getElementById('achaja-share-sheet');
    if (sheet) setTimeout(function(){ sheet.remove(); }, 400);
  }

  /* ──────────────────────────────────────────────────
     메일 발송 — Worker /api/send-result 또는 mailto fallback
     ────────────────────────────────────────────────── */
  function sendByEmail(opts) {
    opts = opts || {};
    var subject = opts.subject || '[ACHAJA] 차량 이력 조회 결과';
    var bodyText = opts.body || '';
    var url = opts.url || location.href;

    // 이메일 입력 모달 표시
    return promptEmail().then(function(email){
      if (!email) return null;
      return submitEmailRequest({ email: email, subject: subject, body: bodyText, url: url, vin: opts.vin || null, plate: opts.plate || null });
    });
  }

  function promptEmail() {
    return new Promise(function(resolve){
      var existing = document.getElementById('achaja-email-modal');
      if (existing) existing.remove();

      var modal = document.createElement('div');
      modal.id = 'achaja-email-modal';
      modal.innerHTML =
        '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;" id="ach-email-backdrop">' +
          '<div style="background:rgb(var(--c-surface,255 255 255));border-radius:20px;width:100%;max-width:420px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">' +
            '<div style="text-align:center;margin-bottom:16px;">' +
              '<div style="width:56px;height:56px;border-radius:50%;background:rgb(var(--c-primary-container,13 71 161))/10;border:2px solid rgb(var(--c-primary-container,13 71 161));display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">📧</div>' +
              '<h3 style="font-family:Manrope,sans-serif;font-size:16px;font-weight:700;color:rgb(var(--c-on-surface,0 0 0));margin:0 0 4px;">결과를 이메일로 받기</h3>' +
              '<p style="font-size:12px;color:rgb(var(--c-muted,100 116 139));margin:0;">조회한 차량 이력 결과를 이메일로 발송해드립니다.</p>' +
            '</div>' +
            '<input id="ach-email-input" type="email" required placeholder="example@email.com" style="width:100%;padding:12px 14px;border:1px solid rgb(var(--c-outline-variant,200 200 200));border-radius:10px;font-size:14px;margin-bottom:8px;background:rgb(var(--c-surface,255 255 255));color:rgb(var(--c-on-surface,0 0 0));"/>' +
            '<p id="ach-email-err" style="font-size:11px;color:#dc2626;margin:0 0 12px;display:none;">올바른 이메일 형식이 아닙니다.</p>' +
            '<div style="background:rgb(var(--c-surface-container-low,243 244 245));border-radius:8px;padding:10px;margin-bottom:16px;">' +
              '<p style="font-size:10px;color:rgb(var(--c-muted,100 116 139));margin:0;line-height:1.5;">※ 이메일은 발송 후 즉시 폐기되며 마케팅·제3자 공유 없음. 1~2분 내 도착하지 않으면 스팸함을 확인해주세요.</p>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<button id="ach-email-cancel" style="flex:1;padding:12px;background:rgb(var(--c-surface-container,237 238 239));border:none;border-radius:10px;font-size:14px;font-weight:600;color:rgb(var(--c-on-surface,0 0 0));cursor:pointer;">취소</button>' +
              '<button id="ach-email-submit" style="flex:1;padding:12px;background:rgb(var(--c-primary-container,13 71 161));border:none;border-radius:10px;font-size:14px;font-weight:700;color:white;cursor:pointer;">발송</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);

      var input = modal.querySelector('#ach-email-input');
      var err = modal.querySelector('#ach-email-err');
      input.focus();

      modal.querySelector('#ach-email-cancel').addEventListener('click', function(){ modal.remove(); resolve(null); });
      modal.querySelector('#ach-email-backdrop').addEventListener('click', function(){ modal.remove(); resolve(null); });
      var doSubmit = function(){
        var v = (input.value || '').trim();
        if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          err.style.display = 'block'; input.focus();
          return;
        }
        modal.remove();
        resolve(v);
      };
      modal.querySelector('#ach-email-submit').addEventListener('click', doSubmit);
      input.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSubmit(); });
    });
  }

  function submitEmailRequest(payload) {
    // Worker 엔드포인트 시도. 없으면 mailto 폴백.
    return fetch('/api/send-result', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        subject: payload.subject,
        body: payload.body,
        url: payload.url,
        vin: payload.vin,
        plate: payload.plate,
        sentAt: new Date().toISOString()
      })
    }).then(function(r){
      if (r.ok) {
        showToast('✓ ' + payload.email + '로 발송했습니다');
        return { ok: true, method: 'api' };
      }
      throw new Error('api_failed');
    }).catch(function(err){
      // 백엔드 미준비 시 mailto 폴백 (운영자가 수동 발송)
      console.info('send-result API 미준비, mailto 폴백', err && err.message);
      var mailtoBody =
        '안녕하세요. ACHAJA 결과를 이메일로 받고 싶습니다.\n\n' +
        '받을 이메일: ' + payload.email + '\n' +
        (payload.vin ? 'VIN: ' + payload.vin + '\n' : '') +
        (payload.plate ? '차량번호: ' + payload.plate + '\n' : '') +
        '결과 URL: ' + payload.url + '\n\n' +
        '※ 운영자 koha3d77@gmail.com에서 수동 발송될 예정입니다.';
      var mailtoLink = 'mailto:koha3d77@gmail.com?subject=' +
        encodeURIComponent('[ACHAJA] 결과 메일 발송 요청 — ' + payload.email) +
        '&body=' + encodeURIComponent(mailtoBody);
      window.location.href = mailtoLink;
      showToast('메일 앱에서 발송해주세요. 운영자가 결과를 회신합니다.');
      return { ok: true, method: 'mailto' };
    });
  }

  /* ──────────────────────────────────────────────────
     Toast 알림 (간단)
     ────────────────────────────────────────────────── */
  function showToast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:white;padding:10px 20px;border-radius:8px;font-size:13px;z-index:1100;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:90vw;text-align:center;';
    document.body.appendChild(t);
    setTimeout(function(){ t.style.transition = 'opacity 0.3s'; t.style.opacity = '0'; }, 2000);
    setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 2400);
  }

  /* 글로벌 노출 */
  global.AchajaShare = {
    share: shareResult,
    sendByEmail: sendByEmail,
    showToast: showToast,
    _copyLink: _copyLink,
    _kakao: _kakao
  };
})(typeof window !== 'undefined' ? window : this);
