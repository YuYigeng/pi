import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import { afterEach, describe, expect, it } from "vitest";
import { toJsonEvent } from "../../../src/modes/json-event.ts";
import { createHarness, type Harness } from "../harness.ts";

describe("regression #7911: JSON message updates include usage", () => {
	const harnesses: Harness[] = [];

	afterEach(() => {
		while (harnesses.length > 0) {
			harnesses.pop()?.cleanup();
		}
	});

	it("keeps current assistant usage after removing cumulative snapshots", async () => {
		const harness = await createHarness();
		harnesses.push(harness);
		harness.setResponses([fauxAssistantMessage("stream usage")]);

		await harness.session.prompt("respond");

		const sessionUpdates = harness.eventsOfType("message_update");
		expect(sessionUpdates.length).toBeGreaterThan(0);

		for (const sessionUpdate of sessionUpdates) {
			if (sessionUpdate.message.role !== "assistant") {
				throw new Error("message_update must contain an assistant message");
			}
			expect(toJsonEvent(sessionUpdate)).toHaveProperty("usage", sessionUpdate.message.usage);
		}
	});
});
