function getTimePercentages() {
	const now = new Date();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentSecond = now.getSeconds();
	// Calculate the remaining minutes in the hour
	const remainingMinutes = currentMinute;

	const hourPercentage = (currentHour / 24) * 100;
	const hour12Percentage = ((currentHour % 12) / 12) * 100;
	const minutePercentage = (currentMinute / 60) * 100;
	const secondPercentage = (currentSecond / 60) * 100;
	// Calculate the percentage of minutes left in the hour
	const minutesLeftPercentage = (remainingMinutes / 60) * 100;

	return {
		hour: hourPercentage,
		hour12: hour12Percentage,
		minute: minutePercentage,
		minutes: minutesLeftPercentage,
		second: secondPercentage
	};
}

function setTime() {
	let p = getTimePercentages();
	let hoursLeftPerc = p.hour * 0.01 * 86400;
	let hours12LeftPerc = p.hour12 * 0.01 * 3600;
	let minsLeftPerc = p.minute * 0.01 * 60;
	let minutesLeftPerc = p.minutes * 0.01 * 3600;
	let secsLeftPerc = p.second * 0.01;
	let cols = ["#5F7DE4", "#89A7F0", "#B3D1C6", "#DDFB9C", "#F4D66F", "#3553BA"];
	document.querySelector(
		"#timeHere"
	).innerHTML = `<circle cx="50" cy="50" r="46" stroke="${cols[0]}" stroke-width="4" fill="none">
			<animate class="hoursAnim" attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 1" dur="86400s" begin="-${hoursLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="46" stroke="${cols[0]}" stroke-width="4" fill="none" stroke-dasharray="291.03" stroke-dashoffset="0" stroke-linecap="round">
			<animate class="hoursAnim" attributeName="stroke-dashoffset" values="0; 291.03" dur="86400s" begin="-${hoursLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="38" stroke="${cols[1]}" stroke-width="3" fill="none">
			<animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 1" dur="3600s" begin="-${hours12LeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="38" stroke="${cols[1]}" stroke-width="3" fill="none" stroke-dasharray="240.76" stroke-dashoffset="0" stroke-linecap="round">
			<animate attributeName="stroke-dashoffset" values="0; 240.76" dur="3600s" begin="-${hours12LeftPerc}s" repeatCount="indefinite" />
		</circle>

		<circle cx="50" cy="50" r="30" stroke="${cols[2]}" stroke-width="2" fill="none">
			<animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 1" dur="3600s" begin="-${minutesLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="30" stroke="${cols[2]}" stroke-width="2" fill="none" stroke-dasharray="190.5" stroke-dashoffset="0" stroke-linecap="round">
			<animate attributeName="stroke-dashoffset" values="0; 190.5" dur="3600s" begin="-${minutesLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="22" stroke="${cols[3]}" stroke-width="1.5" fill="none">
			<animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 1" dur="60s" begin="-${minsLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="22" stroke="${cols[3]}" stroke-width="1.5" fill="none" stroke-dasharray="140.23" stroke-dashoffset="0" stroke-linecap="round">
			<animate attributeName="stroke-dashoffset" values="0; 140.23" dur="60s" begin="-${minsLeftPerc}s" repeatCount="indefinite" />
		</circle>

		<circle cx="50" cy="50" r="16" stroke="${cols[4]}" stroke-width="1" fill="none">
			<animate attributeName="opacity" values="0; 0.25; 1" dur="1s" begin="-${secsLeftPerc}s" repeatCount="indefinite" />
		</circle>
		<circle cx="50" cy="50" r="16" stroke="${cols[4]}" stroke-width="1" fill="none" stroke-dasharray="102.53" stroke-dashoffset="0" stroke-linecap="round">
			<animate attributeName="stroke-dashoffset" values="0; 102.53" dur="1s" begin="-${secsLeftPerc}s" repeatCount="indefinite" />
		</circle>`;
}

setTime();