import { EmbedBuilder, WebhookClient } from "discord.js";
import { asc, InferSelectModel } from "drizzle-orm";
import { and, gte, lt } from "drizzle-orm/expressions";
import cron from "node-cron";

import { db } from "@forge/db/client";
import { Event as DBEvent } from "@forge/db/schemas/knight-hacks";

import { DISCORD_PROD_GUILD_ID, DISCORD_REMINDER_ROLE_ID } from "../consts";
import { env } from "../env";

// Function to retrieve the appropriate events for the day
async function getEvents() {
  // If today is Sunday, return the events for the entire week
  if (new Date().getDay() === 0) {
    // Assemble date objects
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Retrieve events and sort them by start time
    const events = await db
      .select()
      .from(DBEvent)
      .where(
        and(
          gte(DBEvent.start_datetime, today),
          lt(DBEvent.start_datetime, nextWeek),
        ),
      )
      .orderBy(asc(DBEvent.start_datetime));

    // 1) Add a weekday-based prefix to each event
    const eventsWithPrefix = events.map((event) => {
      const weekday = event.start_datetime.toLocaleString("en-US", {
        weekday: "long",
      });
      return {
        ...event,
        prefix: weekday, // e.g. "Monday", "Tuesday", etc.
      };
    });

    // 2) Group them by prefix
    const map = new Map<string, typeof eventsWithPrefix>();
    for (const event of eventsWithPrefix) {
      if (!map.has(event.prefix)) {
        map.set(event.prefix, []);
      }
      map.get(event.prefix)?.push(event);
    }

    // 3) Convert the Map into an array of { prefix, events[] }
    return [...map.entries()].map(([prefix, groupedEvents]) => ({
      prefix,
      events: groupedEvents,
    }));
  }

  // Otherwise (not Sunday): return three prefix groups (Today, Tomorrow, Next Week)

  // 1) Today's boundaries
  const today = new Date();

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // 2) Tomorrow’s boundaries
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // 3) Next Week’s boundaries
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextWeekStart = new Date(nextWeek);
  nextWeekStart.setHours(0, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(23, 59, 59, 999);

  // Query each batch
  const todayEvents = await db
    .select()
    .from(DBEvent)
    .where(
      and(
        gte(DBEvent.start_datetime, todayStart),
        lt(DBEvent.start_datetime, todayEnd),
      ),
    )
    .orderBy(asc(DBEvent.start_datetime));

  const tomorrowEvents = await db
    .select()
    .from(DBEvent)
    .where(
      and(
        gte(DBEvent.start_datetime, tomorrowStart),
        lt(DBEvent.start_datetime, tomorrowEnd),
      ),
    )
    .orderBy(asc(DBEvent.start_datetime));

  const nextWeekEvents = await db
    .select()
    .from(DBEvent)
    .where(
      and(
        gte(DBEvent.start_datetime, nextWeekStart),
        lt(DBEvent.start_datetime, nextWeekEnd),
      ),
    )
    .orderBy(asc(DBEvent.start_datetime));

  // Filter out "Operations Meeting" from nextWeek
  const nextWeekFiltered = nextWeekEvents.filter(
    (event) => !event.name.includes("Operations Meeting"),
  );

  // Build the final array of prefix groups
  type EventRow = InferSelectModel<typeof DBEvent>;
  const prefixGroups: {
    prefix: string;
    events: (EventRow & { prefix: string })[];
  }[] = [];

  if (todayEvents.length > 0) {
    prefixGroups.push({
      prefix: "Today",
      events: todayEvents.map((evt) => ({ ...evt, prefix: "Today" })),
    });
  }

  if (tomorrowEvents.length > 0) {
    prefixGroups.push({
      prefix: "Tomorrow",
      events: tomorrowEvents.map((evt) => ({ ...evt, prefix: "Tomorrow" })),
    });
  }

  if (nextWeekFiltered.length > 0) {
    prefixGroups.push({
      prefix: "Next Week",
      events: nextWeekFiltered.map((evt) => ({
        ...evt,
        prefix: "Next Week",
      })),
    });
  }

  return prefixGroups;
}

// Extract the cron job body so we can have a pre-reminders hook to test the logic each morning
async function cronLogic(webhook: WebhookClient) {
  // Gather all of the events for the day (grouped by prefix)
  const groupedPrefixes = await getEvents();

  // Calculate total number of events across all prefix groups
  const totalEvents = groupedPrefixes.reduce(
    (sum, group) => sum + group.events.length,
    0,
  );

  // If there are no events, send no events message
  if (totalEvents === 0) {
    return;
  }

  // If today is Sunday, send the events for the entire week
  if (new Date().getDay() === 0) {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + 6);

    const formattedDate = `${today.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    })} - ${nextSunday.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    })}`;

    await webhook.send({
      content: `# Events this Week (${formattedDate})\nWe hope you've had an amazing weekend so far, @everyone :D\nHere are some of the events planned for this week!`,
    });
  } else {
    // If today is not Sunday, send the events for the day
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    await webhook.send({
      content: `# Event Reminders\nGood morning, <@&${DISCORD_REMINDER_ROLE_ID}>!\nToday is ${formattedDate}, and here are some reminders about upcoming events!`,
    });
  }

  // For each prefix group, send a line announcing the prefix, then send each event as an embed
  for (const group of groupedPrefixes) {
    // Send a message telling the prefix category
    await webhook.send(`## ${group.prefix}`);

    // Now iterate through this group’s events
    for (const event of group.events) {
      const formattedTag =
        "[" + event.tag.toUpperCase().replace(" ", "-") + "]";

      // Construct the event URL
      const discordEventURL =
        "https://discord.com/events/" +
        DISCORD_PROD_GUILD_ID +
        "/" +
        event.discordId;

      const eventEmbed = new EmbedBuilder()
        .setColor(0xcca4f4)
        .setTitle(event.name)
        .setAuthor({
          name: `${formattedTag}`,
        })
        .setURL(discordEventURL)
        .setDescription(event.description)
        .addFields([
          {
            name: "Date",
            value: event.start_datetime.toLocaleString("en-US", {
              dateStyle: "full",
            }),
            inline: true,
          },
          {
            name: "Location",
            value: event.location,
            inline: true,
          },
          {
            // Force next row (if you'd prefer none, remove these)
            name: "\t",
            value: "\t",
          },
          {
            name: "Start",
            value: event.start_datetime.toLocaleString("en-US", {
              timeStyle: "short",
            }),
            inline: true,
          },
          {
            name: "End",
            value: event.end_datetime.toLocaleString("en-US", {
              timeStyle: "short",
            }),
            inline: true,
          },
        ])
        .setThumbnail("https://i.imgur.com/Jr1cyxT.png");

      // Send the message (embed)
      await webhook.send({
        embeds: [eventEmbed],
      });
    }
  }

  // Closing message
  await webhook.send({
    content: `We hope to see you all there! If you are interested in opting in to daily event reminders, please assign yourself the <@&${DISCORD_REMINDER_ROLE_ID}> role in <id:customize>!`,
  });
}

// Event Reminders webhook
export function execute() {
  // Create a public and pre (hidden) webhook client for daily reminders
  const pubWebhook = new WebhookClient({
    url: env.DISCORD_DAILY_REMINDERS_WEBHOOK_URL,
  });
  const preWebhook = new WebhookClient({
    url: env.DISCORD_PRE_DAILY_REMINDERS_WEBHOOK_URL,
  });

  try {
    // PRE-REMINDERS for Testing: 8:00AM
    cron.schedule("0 12 * * *", () => {
      // Avoid returning a Promise from the cron callback
      void cronLogic(preWebhook);
    });

    // PUBLIC-REMINDERS for Testing: 12:00PM
    cron.schedule("0 16 * * * *", () => {
      // Avoid returning a Promise from the cron callback
      void cronLogic(pubWebhook);
    });
  } catch (err) {
    // silences eslint. type safety with our errors basically
    console.error("An unknown error occurred: ", err);
  }
}
