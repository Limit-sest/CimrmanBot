import { Events, EmbedBuilder, Client, type Channel } from 'discord.js';
import dayjs from 'dayjs';
import { prisma } from '../prisma';

function hashCode(s) {
  return s.split('').reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    setInterval(async () => {
      const embed = new EmbedBuilder();
      for (let i = 0; i < 2; i++) {
        // 0 for today 1 for tomorrow
        const date = dayjs().add(i, 'day').format('YYYYMMDD');
        const request = await fetch(
          `https://obrazovka.200solutions.com/api.php?date=${date}`
        );
        const data: any = await request.json();
        const classData = data.ChangesForClasses.find(
          (changes) => changes.Class.Id === '29'
        );
        const cancelled = classData.CancelledLessons;
        const changed = classData.ChangedLessons;

        // Skip if already announced
        if (
          await prisma.timetableUpdate.findFirst({
            where: {
              date: date,
              data: hashCode(JSON.stringify(classData)),
            },
          })
        )
          return;

        if (cancelled.lenght > 0) {
          let text = '';
          cancelled.forEach((change) => {
            text += `${change.Hour}. hodina ${change.Subject} (${change.Group}) ${change.ChgType1} ${change.ChgType2}\n`;
          });
          embed.addFields({
            name: `${i === 0 ? 'Dnešní' : 'Zítřejší'} odpadlé hodiny 🥳`,
            value: text,
          });
        }

        if (changed.lenght > 0) {
          let text = '';
          cancelled.forEach((change) => {
            text += `${change.Hour}. hodina – ${change.Teacher} ${change.ChgType1} ${change.Subject} ${change.group ? '(' : ''}${change.group}${change.group ? ')' : ''} ${change.ChgType2} v místnosti ${change.Room}\n`;
          });
          embed.addFields({
            name: `${i === 0 ? 'Dnešní' : 'Zítřejší'} změněné hodiny`,
            value: text,
          });
        }

        if (cancelled.lenght > 0 || changed.lenght > 0) {
          prisma.timetableUpdate.create({
            data: {
              date: date,
              data: hashCode(JSON.stringify(classData)),
            },
          });
        }
      }

      const channel = client.channels.cache.get(
        process.env.ANNOUNCEMENT_CH as string
      );
      embed.setTitle('Změny v rozvrhu');
      channel.send({ embeds: [embed] });
    }, 6000);
  },
};
