import type { DrawViewModel } from './view-model.js';
import type { PublicDrawDto, Division, Team } from '../domain/types.js';
import { verifyDrawCommitment } from '../domain/commitment.js';
import teamsData from '../../config/teams.json' with { type: 'json' };
import divisionsData from '../../config/divisions.json' with { type: 'json' };

function setupCopyButton(btn: HTMLButtonElement, hashToCopy: string): void {
  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(hashToCopy);
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

function renderVerificationOutcome(box: HTMLElement, dto: PublicDrawDto): void {
  if (!dto.verification) return;
  const res = verifyDrawCommitment(
    dto.verification.canonicalPayload,
    dto.commitmentHash,
    teamsData as readonly Team[],
    divisionsData as readonly Division[]
  );
  box.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = res.valid
    ? '✓ Verificación matemática superada: el sorteo es íntegro e inalterado.'
    : '✗ Fallo en la verificación del compromiso.';
  title.style.color = res.valid ? 'var(--color-success)' : 'var(--color-live)';
  box.appendChild(title);
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
  if (copyBtn) {
    setupCopyButton(copyBtn, vm.commitmentHash);
  }

  const verifyBox = container.querySelector<HTMLElement>('[data-ref="verification-box"]');
  if (verifyBox) {
    if (vm.isComplete && dto.verification) {
      verifyBox.style.display = 'block';
      renderVerificationOutcome(verifyBox, dto);
    } else {
      verifyBox.style.display = 'none';
    }
  }
}
