export async function sendDiscordNotification(embed: {
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("placeholder")) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Vortex Bot",
        embeds: [
          {
            ...embed,
            color: embed.color ?? 0x5865f2,
            timestamp: new Date().toISOString(),
            footer: { text: "Vortex Marketplace Engine" },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn("Discord webhook notification failed:", err);
  }
}

export async function sendDiscordOrderNotification({
  orderNumber,
  customerEmail,
  amount,
  itemCount,
  paymentMethod,
}: {
  orderNumber: string;
  customerEmail: string;
  amount: number;
  itemCount: number;
  paymentMethod: string;
}) {
  await sendDiscordNotification({
    title: `🛒 New Order Placed: #${orderNumber}`,
    description: `Customer: **${customerEmail}**\nTotal: **$${amount.toFixed(2)}**\nItems: **${itemCount}**\nGateway: **${paymentMethod}**`,
    color: 0x10b981,
  });
}
