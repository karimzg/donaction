import { useEffect, useId, useRef, useState } from 'react';
import { Arg0Type, FieldInterface } from '@/partials/sponsorshipForm/logic/entities';

export default function useInputField(props: FieldInterface) {
	const id = useId();
	const firstEdit = useRef(true);
	const mounted = useRef(false);
	const ref = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<string>('');
	const frozenValue = useRef(props.defaultValue);

	const getValue = () => {
		if (props.type === 'checkbox') return Boolean(ref.current?.checked);
		if (props.cast === Boolean) return Number(ref.current?.value || '');
		return ref.current?.value || '';
	};

	const validateField = (value: Arg0Type) => {
		if (props.validation) {
			return props.validation(value, String(props.label));
		}
		return '';
	};

	const feedback = () => {
		const validationResult = validateField(getValue());
		setMessage(validationResult);
		props.feedback &&
			props.feedback({
				attribute: { name: props.name || 'N/A', value: props.cast(getValue()) },
				cast: props.cast,
				isValid: !Boolean(validationResult),
			});
	};

	const getCleanProps = () => {
		const cleanProps = { ...props } as any;
		[
			//
			'label',
			'isRequired',
			'feedback',
			'validation',
			'triggerValidation',
			'cast',
			'parentClassName',
			'countriesList',
			'options',
			'extraType',
			'clearValues',
			'hideError',
			'forceError',
		].forEach((_) => {
			delete cleanProps[_];
		});
		return cleanProps;
	};

	const getComposedClassName = () => {
		return `${props.className ?? ''} ${
			!message && ref.current?.value ? 'valid' : !!message ? 'invalid' : ''
		}`;
	};

	useEffect(() => {
		if (mounted.current) {
			if (props.triggerValidation && props.name) {
				feedback();
			}
		} else {
			mounted.current = true;
			if (props.defaultValue) {
				feedback();
			}
		}
	}, [props.triggerValidation, props.value]);

	useEffect(() => {
		if (ref.current) {
			// TODO: fix default value when 2 render
			// console.log(props.name, props.defaultValue, frozenValue.current);
			// ref.current.value = String(frozenValue.current);
		}
	}, [props.clearValues]);

	const onBlur = () => {
		if (firstEdit.current) {
			firstEdit.current = false;
		}
		feedback();
	};

	const onChange = () => {
		if (!firstEdit.current || props.extraType === 'select') {
			feedback();
		}
	};

	return {
		id,
		ref,
		onBlur,
		message,
		onChange,
		feedback,
		getCleanProps,
		getComposedClassName,
	};
}
