class Validator {
	static isName(name: string) {
		let str = /^[a-zA-z ]{3,64}$/;
		return str.test(name);
	}

	static isFoodName(name: string) {
		let str = /^[a-zA-Z0-9 ]{2,100}$/;
		return str.test(name);
	}

	static isEmail(email: string) {
		let mail =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return mail.test(String(email).toLowerCase());
	}

	static isPassword(password: string) {
		let word =
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,15}$/;
		return word.test(password);
	}

	static isRole(role: string) {
		return role === 'admin' || role === 'general';
	}

	static isValidDateTime(date: string | Date, time: string){
		let inputDate = new Date(date);
		inputDate.setHours(Number(time.split(':')[0]))
		inputDate.setMinutes(Number(time.split(':')[1]))
		inputDate.setSeconds(0)

		return new Date().getTime() >= inputDate.getTime();
	}
}

export default Validator;