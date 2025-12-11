document.addEventListener('DOMContentLoaded', () => {
	const display = document.querySelector('.display');
	const buttons = document.querySelectorAll('.btn');
	let expr = '';
	const MAX_LENGTH = 200;

	function updateDisplay(content) {
		display.textContent = (typeof content === 'string') ? content : (expr || '0');
	}

	function lastChar() {
		return expr.slice(-1);
	}

	function isOperator(ch) {
		return ch === '+' || ch === '-' || ch === '*' || ch === '/';
	}

	function appendDigit(d) {
		if (expr.length >= MAX_LENGTH) return;
		expr += d;
		updateDisplay();
	}

	function appendOperator(op) {
		if (!expr) {
			if (op === '-') { // allow negative numbers
				expr = '-';
				updateDisplay();
			}
			return;
		}

		const last = lastChar();
		if (isOperator(last)) {
			// replace the previous operator with the new one
			expr = expr.slice(0, -1) + op;
		} else {
			expr += op;
		}
		updateDisplay();
	}

	function appendDecimal() {
		// Prevent multiple decimals in the current number
		const parts = expr.split(/\+|\-|\*|\//);
		const lastNum = parts[parts.length - 1] || '';
		if (lastNum.includes('.')) return;
		if (!lastNum) {
			// if starting a new number (e.g., after operator), prepend 0
			expr += '0.';
		} else {
			expr += '.';
		}
		updateDisplay();
	}

	function clearAll() {
		expr = '';
		updateDisplay();
	}

	function backspace() {
		expr = expr.slice(0, -1);
		updateDisplay();
	}

	function evaluateExpr() {
		if (!expr) return;
		// If ends with operator, remove it
		if (isOperator(lastChar())) expr = expr.slice(0, -1);

		// basic safety: allow only digits, operators, parentheses, decimal and spaces
		const safe = expr.replace(/×/g, '*').replace(/÷/g, '/');
		if (!/^[0-9+\-*/().\s]+$/.test(safe)) {
			updateDisplay('Error');
			expr = '';
			return;
		}

		try {
			// evaluate using Function to avoid scope access
			const result = Function('"use strict"; return (' + safe + ')')();
			if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
				updateDisplay('Error');
				expr = '';
				return;
			}
			expr = String(result);
			updateDisplay();
		} catch (e) {
			updateDisplay('Error');
			expr = '';
		}
	}

	// Attach click handlers
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.id;
			const val = btn.textContent.trim();
			if (/^[0-9]$/.test(val)) {
				appendDigit(val);
				return;
			}
			if (val === '.') {
				appendDecimal();
				return;
			}
			if (val === '+' || val === '-' || val === '*' || val === '/') {
				appendOperator(val);
				return;
			}
			if (id === 'equals' || val === '=') {
				evaluateExpr();
				return;
			}
			if (id === 'clear' || val.toLowerCase() === 'clear') {
				clearAll();
				return;
			}
			if (id === 'backspace' || val === '⌫') {
				backspace();
				return;
			}
		});
	});

	// Keyboard support
	window.addEventListener('keydown', (e) => {
		const k = e.key;
		if (/^[0-9]$/.test(k)) {
			appendDigit(k);
			e.preventDefault();
			return;
		}
		if (k === '.') {
			appendDecimal();
			e.preventDefault();
			return;
		}
		if (k === '+' || k === '-' || k === '*' || k === '/') {
			appendOperator(k);
			e.preventDefault();
			return;
		}
		if (k === 'Enter' || k === '=') {
			evaluateExpr();
			e.preventDefault();
			return;
		}
		if (k === 'Backspace') {
			backspace();
			e.preventDefault();
			return;
		}
		if (k === 'Escape' || k === 'c' && e.ctrlKey) {
			clearAll();
			e.preventDefault();
			return;
		}
	});

	// initialize
	updateDisplay();
});

