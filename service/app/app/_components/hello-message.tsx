"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

export function HelloMessage() {
	const [message, setMessage] = useState<string>();

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch("/api/hello");
			const { message } = await res.json();
			setMessage(message);
		};
		fetchData();
	}, []);

	if (!message) return <p>Loading...</p>;

	return (
		<div>
			<p className="text-xl">{message}</p>
			<Button>My Button</Button>
		</div>
	);
}
