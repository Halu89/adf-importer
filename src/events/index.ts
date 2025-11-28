export async function handleEvent(event: unknown, context: unknown) {
    console.log(`Event received: ${JSON.stringify(event)}`);
    console.log(`Context: ${JSON.stringify(context)}`);
}

export default { handleEvent };