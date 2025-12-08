export default function objEqObj(form1: Record<string, any>, form2: Record<string, any>) {
	let result = false;
	form1 = structuredClone(form1);
	form2 = structuredClone(form2);
	if (Object.keys(form1).length !== Object.keys(form2).length) return result;
	result = Object.keys(form1).every((key, _index) => {
		if (form2[key] === form1[key]) {
			delete form2[key];
			return true;
		}
		return false;
	});
	return result && Object.keys(form2).length === 0;
}
