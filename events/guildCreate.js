const client = require("../index");
const { MessageEmbed } = require("discord.js");

client.on("guildCreate", async (guild) => {
  if (!guild) return;
  let channel = guild.channels.cache.find(
    (ch) =>
      ch.type === "GUILD_TEXT" &&
      ch.permissionsFor(guild.me).has("SEND_MESSAGES")
  );

  if (guild.me.permissions.has("USE_APPLICATION_COMMANDS")) {
    try {
      guild.commands
        .set(client.arrayOfCommands)
        .then((s) => {
          channel.send(`Successfully reloaded application (/) commands.`);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e.message);
    }
  } else {
    channel.send(
      `ฉันไม่มี \`USE_APPLICATION_COMMANDS\` ดังนั้นฉันจึงไม่สามารถสร้างคำสั่งทับในเซิร์ฟเวอร์ของคุณได้ ถ้าคุณต้องการใช้ฉัน ให้ 'USE_APPLICATION_COMMANDS\` แล้วเชิญใหม่`
    );
  }
});
