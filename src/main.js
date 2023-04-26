import EventEmitter from './event-emitter.js';
import LanguageBixolon from './languages/bixolon.js';
import LanguageDigipos from './languages/digipos.js';

class WebSerialCustomerDisplay {

	constructor(options) {
		this._internal = {
			emitter:    new EventEmitter(),
			language:   null,
			port:     	null,
			writer:		null,
			options:	Object.assign({
				language:		'auto',
				baudRate:		9600,
				bufferSize:		255,
				dataBits:		8,
				flowControl:	'none',
				parity:			'none',
				stopBits:		1
			}, options)
		};

		this._state = {
			lines: [
				new Uint8Array(20),
				new Uint8Array(20)
			],
		}

		navigator.serial.addEventListener('disconnect', event => {
			if (this._internal.port == event.target) {
				this._internal.emitter.emit('disconnected');
			}
		});
	}

	async connect() {
		try {
			let port = await navigator.serial.requestPort();
			
			if (port) {
				await this.open(port);
			}
		}
		catch(error) {
			console.log('Could not connect! ' + error);
		}
	}

	async reconnect(previousPort) {
		if (!previousPort.vendorId || !previousPort.productId) {
			return;
		}

		let ports = await navigator.serial.getPorts();

		let matches = ports.filter(port => {
			let info = port.getInfo();
			return info.usbVendorId == previousPort.vendorId && info.usbProductId == previousPort.productId;
		})

		if (matches.length == 1) {
			await this.open(matches[0]);
		}
	}

	async disconnect() {
		if (!this._internal.port) {
			return;
		}

		this._internal.writer.releaseLock();
		await this._internal.port.close();

		this._internal.port = null;
		this._internal.writer = null;

		this._internal.emitter.emit('disconnected');
	}

	async open(port) {
		this._internal.port = port;

		await this._internal.port.open(this._internal.options);

		let info = this._internal.port.getInfo();

		/* Determine language */

		let language = this._internal.options.language;

		if (language == 'auto') {
			if (info.usbVendorId == 0x1504) {
				language = 'bixolon';
			}
			else if (info.usbVendorId == 0x10c4) {
				language = 'digipos';
			}
			else {
				throw new Error('Unknown language for device: ' + info.usbVendorId + ':' + info.usbProductId);
			}
		}

		switch(language) {
			case 'bixolon':
				this._internal.language = new LanguageBixolon();
				break;
			case 'digipos':
				this._internal.language = new LanguageDigipos();
				break;
			default:
				throw new Error('Unknown language: ' + this._internal.options.language);
		}

		/* Open writer */

		this._internal.writer = this._internal.port.writable.getWriter();

		this._internal.emitter.emit('connected', {
			type:				'serial',
			language:			language,
			vendorId: 			info.usbVendorId || null,
			productId: 			info.usbProductId || null
		});
	}

	async clear() {
		await this._internal.writer.write(this._internal.language.clear());
	}

	async line(value) {
		if (value instanceof Array) {
			let line;

			line = value.length >= 1 ? value[0] : '';
			this._state.lines[0] = this._internal.language.encode((line + ' '.repeat(20)).substring(0, 20));

			line = value.length >= 2 ? value[1] : '';
			this._state.lines[1] = this._internal.language.encode((line + ' '.repeat(20)).substring(0, 20));
		}

		if (typeof value == 'string') {
			this._state.lines[0] = this._state.lines[1];
			this._state.lines[1] = this._internal.language.encode((value + ' '.repeat(20)).substring(0, 20));
		}

		await this._internal.writer.write(this._internal.language.clear());
		await this._internal.writer.write(this._state.lines[0]);
		await this._internal.writer.write(this._state.lines[1]);
	}

	addEventListener(n, f) {
		this._internal.emitter.on(n, f);
	}
}

export default WebSerialCustomerDisplay;