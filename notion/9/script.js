window.addEventListener("DOMContentLoaded",() => {
	const gpr = new GlassProgressRing(".pl");
	const replayBtn = document.querySelector("#replay");

	replayBtn?.addEventListener("click",gpr.replay.bind(gpr));
});

class GlassProgressRing {
	complete = false;
	percent = 0;
	startTime = 600;
	timeout = null;

	constructor(el) {
		this.el = document.querySelector(el);

		this.init();
	}
	init() {
		this.toggleComplete();
		this.progressDisplay();
		this.timeout = setTimeout(this.loop.bind(this),this.startTime);
	}
	loop() {
		if (!this.complete) {
			this.progressInc();
			this.timeout = setTimeout(this.loop.bind(this),17);
		}
	}
	progressDisplay() {
		this.el?.style.setProperty("--percent",this.percent);

		const percentText = `${Math.round(this.percent * 100)}%`;
		const percentEl = this.el?.querySelector("[data-percent]");

		if (percentEl) percentEl.innerHTML = percentText;
	}
	progressInc(amount = 0.01) {
		if (this.percent < 1) {
			this.percent += amount;
			this.percent = +this.percent.toFixed(2);
		}
		if (this.percent >= 1) {
			this.percent = 1;
			this.complete = true;
			this.toggleComplete();
		}
		this.progressDisplay();
	}
	replay() {
		if (this.complete) {
			this.complete = false;
			this.percent = 0;
			this.init();
		}
	}
	toggleComplete() {
		this.el?.setAttribute("data-complete",this.complete);
	}
}