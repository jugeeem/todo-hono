"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<RouterProvider navigate={router.push}>
			<I18nProvider locale="ja-JP">{children}</I18nProvider>
		</RouterProvider>
	);
}
