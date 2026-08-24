import type { DrawViewModel } from './view-model.js';
import type { PublicDrawDto, Division, Team } from '../domain/types.js';
import { verifyDrawCommitment } from '../domain/commitment.js';
import teamsData from '../../config/teams.json' with { type: 'json' };
import divisionsData from '../../config/divisions.json' with { type: 'json' };

function setupCopyButton(btn: HTMLButtonElement, textToCopy: string): void {
  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      const prevText = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(() => {
        btn.textContent = prevText;
      }, 2000);
    } catch {
      btn.textContent = 'Error al copiar';
    }
  };
}

function buildVerificationDetails(payload: string, seed: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'verification-details';

  const seedRow = document.createElement('div');
  seedRow.className = 'verification-row';
  seedRow.innerHTML = `<span>Semilla revelada:</span> <code class="hash-code">${seed}</code>`;

  const cmdRow = document.createElement('div');
  cmdRow.className = 'verification-row';
  const cmd = `echo -n '${payload.replace(/'/g, "'\\''")}' | shasum -a 256`;
  cmdRow.innerHTML = `<span>Comando de auditoría:</span> <code class="hash-code">${cmd}</code>`;

  const copyCmdBtn = document.createElement('button');
  copyCmdBtn.type = 'button';
  copyCmdBtn.className = 'btn-copy';
  copyCmdBtn.textContent = 'Copiar comando';
  setupCopyButton(copyCmdBtn, cmd);

  container.appendChild(seedRow);
  container.appendChild(cmdRow);
  container.appendChild(copyCmdBtn);
  return container;
}

function renderVerificationOutcome(box: HTMLElement, dto: PublicDrawDto): void {
  if (!dto.verification) return;
  const res = verifyDrawCommitment(
    dto.verification.canonicalPayload,
    dto.commitmentHash,
    teamsData as readonly Team[],
    divisionsData as readonly Division[]
  );
  box.replaceChildren();
  const title = document.createElement('div');
  title.className = 'verification-status';
  title.textContent = res.valid
    ? '✓ Verificación matemática superada: el sorteo es íntegro e inalterado.'
    : '✗ Fallo en la verificación del compromiso.';
  title.style.color = res.valid ? 'var(--color-success)' : 'var(--color-live)';
  box.appendChild(title);
  box.appendChild(
    buildVerificationDetails(dto.verification.canonicalPayload, dto.verification.seedHex)
  );
}

export function renderVerification(
  container: HTMLElement,
  vm: DrawViewModel,
  dto: PublicDrawDto
): void {
  const hashEl = container.querySelector<HTMLElement>('[data-ref="commitment-hash"]');
  if (hashEl) {
    hashEl.textContent = vm.shortHash;
    hashEl.title = vm.commitmentHash;
  }
  const copyBtn = container.querySelector<HTMLButtonElement>(
    '[data-ref="btn-copy-hash"]'
  );
  if (copyBtn) setupCopyButton(copyBtn, vm.commitmentHash);

  const verifyBox = container.querySelector<HTMLElement>('[data-ref="verification-box"]');
  if (verifyBox) {
    if (vm.isComplete && dto.verification) {
      verifyBox.style.display = 'flex';
      renderVerificationOutcome(verifyBox, dto);
    } else {
      verifyBox.style.display = 'none';
    }
  }
}
