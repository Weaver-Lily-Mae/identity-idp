import Cleave from 'cleave.js';
const { I18n } = window.LoginGov;

/* eslint-disable no-new */
function formatSSNField() {
  const inputs = document.querySelectorAll('input.ssn[type="password"]');

  if (inputs) {
    [].slice.call(inputs).forEach((input, i) => {
      input.parentNode.classList.add('relative');

      const el = `
        <div class="top-n24 right-0 absolute">
          <label class="btn-border" for="pw-toggle-${i}">
            <div class="checkbox">
              <input id="pw-toggle-${i}" type="checkbox">
              <span class="indicator"></span>
              ${I18n.t('forms.passwords.show')}
            </div>
          </label>
        </div>`;
      input.insertAdjacentHTML('afterend', el);

      const toggle = document.getElementById(`pw-toggle-${i}`);
      toggle.addEventListener('change', function () {
        let ssnCleave;
        debugger;

        input.type = toggle.checked ? 'text' : 'password';

        if(!toggle.checked) {
          if (ssnCleave) {
            ssnCleave.destroy();
          }

          input.value = input.value.replace(/-/g, '');
        } else {
          ssnCleave = new Cleave(input, {
            numericOnly: true,
            blocks: [3, 2, 4],
            delimiter: '-',
          });
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', formatSSNField);
