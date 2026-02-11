import { App, Modal } from 'obsidian';

export type ReviewDecision = 'accepted' | 'rejected';

export interface CurrentNoteReviewModalOptions {
	notePath: string;
	proposedContent: string;
}

export class CurrentNoteReviewModal extends Modal {
	private readonly options: CurrentNoteReviewModalOptions;
	private resolver: ((decision: ReviewDecision) => void) | null = null;
	private decided = false;

	constructor(app: App, options: CurrentNoteReviewModalOptions) {
		super(app);
		this.options = options;
	}

	openAndWait(): Promise<ReviewDecision> {
		return new Promise<ReviewDecision>((resolve) => {
			this.resolver = resolve;
			this.open();
		});
	}

	override onOpen(): void {
		const { contentEl, titleEl } = this;
		titleEl.setText('Revisar propuesta para nota actual');

		contentEl.empty();
		contentEl.createEl('p', { text: `Nota objetivo: ${this.options.notePath}` });
		contentEl.createEl('p', {
			text: 'Revisa la propuesta antes de aplicar cambios. No se escribirá nada sin aceptar.'
		});

		const preview = contentEl.createEl('textarea', { cls: 'brainos-review-preview' });
		preview.value = this.options.proposedContent;
		preview.rows = 18;
		preview.cols = 80;
		preview.readOnly = true;

		const actions = contentEl.createDiv({ cls: 'brainos-review-actions' });

		const rejectButton = actions.createEl('button', { text: 'Rechazar' });
		rejectButton.addEventListener('click', () => {
			this.resolve('rejected');
			this.close();
		});

		const acceptButton = actions.createEl('button', {
			text: 'Aceptar',
			cls: 'mod-cta'
		});
		acceptButton.addEventListener('click', () => {
			this.resolve('accepted');
			this.close();
		});
	}

	override onClose(): void {
		this.contentEl.empty();
		if (!this.decided) {
			this.resolve('rejected');
		}
	}

	private resolve(decision: ReviewDecision): void {
		if (this.decided) {
			return;
		}
		this.decided = true;
		this.resolver?.(decision);
		this.resolver = null;
	}
}
