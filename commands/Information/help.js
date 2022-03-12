const { Command } = require("reconlx");
const ee = require("../../settings/embed.json");
const config = require("../../settings/config.json");
const {
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const emoji = require("../../settings/emoji.json");

const emo = {
  Information: emoji.info,
  Filters: emoji.filters,
  Music: emoji.music,
  Config: emoji.setup,
};

module.exports = new Command({
  // options
  name: "help",
  description: `ต้องการความช่วยเหลือ ? คลิกเลยเพื่อดูคำสั่ง`,
  userPermissions: ["SEND_MESSAGES"],
  botPermissions: ["SEND_MESSAGES"],
  category: "Information",
  cooldown: 10,
  options: [
    {
      name: "command",
      description: "name of the command",
      type: "STRING",
      required: false,
    },
  ],
  // command start
  run: async ({ client, interaction, args, prefix }) => {
    // Code
    try {
      // code
      const commandopt = interaction.options.getString("command");
      const derescommand = await client.commands.get(commandopt);
      if (!commandopt) {
        let raw = new MessageActionRow().addComponents([
          new MessageSelectMenu()
            .setCustomId(`help-menu`)
            .setPlaceholder(`คลิกเพื่อดูหมวดหมู่ทั้งหมดของหนู`)
            .addOptions([
              client.categories.map((cat, index) => {
                return {
                  label: `${cat[0].toUpperCase() + cat.slice(1)}`,
                  value: `${index}`,
                  emoji: emo[cat],
                  description: `คลิกเพื่อดูคำสั่งของ ${cat}`,
                };
              }),
            ]),
        ]);

        let button_back = new MessageButton()
          .setStyle(`PRIMARY`)
          .setCustomId(`1`)
          .setEmoji(`◀️`);
        let button_home = new MessageButton()
          .setStyle(`DANGER`)
          .setCustomId(`2`)
          .setEmoji(`🏠`);
        let button_forward = new MessageButton()
          .setStyle("PRIMARY")
          .setCustomId(`3`)
          .setEmoji("▶️");
        let button_tutorial = new MessageButton()
          .setStyle(`LINK`)
          .setEmoji(`🌞`)
          .setLabel(`Tutorial`)
          .setURL(`https://discord.gg/tavy9kmuKW`);

        let buttonRow = new MessageActionRow().addComponents([
          button_back,
          button_home,
          button_forward,
          button_tutorial,
        ]);
        let embed = new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
          .addField(`**🐰  ดูคำสั่งหนูทั้งหมด **`,
            `** รวม ${client.commands.size} คำสั่งและ Total ${client.subcmd.size} คำสั่งย่อย **`
          )
          .addField(
            `** Developer Info **`,
            `**Name: <@852727096505270323> | [facebook](https://www.facebook.com/profile.php?id=100016585352215) | [Dicord](https://discord.gg/tavy9kmuKW) ** \n\n`
          );
        await interaction
          .followUp({
            embeds: [embed],
            components: [buttonRow, raw],
          })
          .then(async (mainmsg) => {
            var embeds = [embed];
            for (const e of allotherembeds_eachcategory(true)) embeds.push(e);
            let currentPage = 0;
            let filter = (m) => m.user.id === interaction.user.id;
            let collector = await mainmsg.createMessageComponentCollector({
              filter: filter,
              time: 3000 * 60,
            });

            collector.on(`collect`, async (b) => {
              try {
                if (b.isButton()) {
                  await b.deferUpdate().catch((e) => {});
                  //page forward
                  if (b.customId == `1`) {
                    //b.reply(`***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*`, true)
                    if (currentPage !== 0) {
                      currentPage -= 1;
                    } else {
                      currentPage = embeds.length - 1;
                    }
                  }
                  //go home
                  else if (b.customId == `2`) {
                    //b.reply(`***Going Back home***, *please wait 2 Seconds for the next Input*`, true)
                    currentPage = 0;
                  }
                  //go forward
                  else if (b.customId == `3`) {
                    //b.reply(`***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*`, true)
                    if (currentPage < embeds.length - 1) {
                      currentPage++;
                    } else {
                      currentPage = 0;
                    }
                  }
                  await mainmsg
                    .edit({
                      embeds: [embeds[currentPage]],
                      components: [buttonRow, raw],
                    })
                    .catch((e) => {});
                  b.deferUpdate().catch((e) => {});
                }
                if (b.isSelectMenu()) {
                  if (b.customId === `help-menu`) {
                    await b.deferUpdate().catch((e) => {});
                    let directory = b.values[0];
                    let aa = allotherembeds_eachcategory(true);
                    mainmsg
                      .edit({
                        embeds: [aa[directory]],
                      })
                      .catch((e) => {});
                  }
                }
              } catch (e) {
                console.log(e.stack ? String(e.stack) : String(e));
                console.log(String(e));
              }
            });
            collector.on("end", async () => {
              mainmsg.edit({
                embeds: [embeds[0]],
                components: [],
              });
            });
          })
          .catch((e) => {
            interaction.followUp(
              `เกิดข้อผิดพลาดในการส่งข้อความช่วยเหลือ \n ${String(e)}`
            );
          });
        function allotherembeds_eachcategory(filterdisabled = false) {
          var embeds = [];

          // config embed
          let Config_Embed = new MessageEmbed()
            .setColor(ee.color)
            .setTitle(`Config Commands`)
            .setDescription(
              `*${client.commands
                .filter((cmd) => cmd.category === `Config`)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cmd) => {
                  return `\`${cmd.name}\``;
                })
                .join(", ")}*`
            )
            .addField(
              `${emoji.dj} DJ Commands`,
              `*${client.commands
                .filter((cmd) => cmd.category === `Config` && cmd.name === `dj`)
                .map((sub) => {
                  return sub.options
                    .filter((cmd) => cmd.type === "SUB_COMMAND")
                    .map((cmd) => `\`${sub.name} ${cmd.name}\``)
                    .join(", ");
                })}*`
            );
          embeds.push(Config_Embed);

          // filters embed
          let Filters_Embed = new MessageEmbed()
            .setColor(ee.color)
            .setTitle(`Filters Commands`)
            .addField(`** วิธีใช้ ? **`, `>>> \`${prefix}filter <name>\``)
            .setDescription(
              `*${client.commands
                .filter(
                  (cmd) => cmd.category === `Filters` && cmd.name === `filter`
                )
                .map((sub) => {
                  return sub.options
                    .filter((cmd) => cmd.type === "SUB_COMMAND")
                    .map((cmd) => `\`${cmd.name}\``)
                    .join(", ");
                })}*`
            );
          embeds.push(Filters_Embed);

          // info embed
          let Information_Embed = new MessageEmbed()
            .setColor(ee.color)
            .setTitle(`Information Commands`)
            .setDescription(
              `*${client.commands
                .filter((cmd) => cmd.category === `Information`)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cmd) => {
                  return `\`${cmd.name}\``;
                })
                .join(", ")}*`
            );
          embeds.push(Information_Embed);
          // music embed
          let Music_Embed = new MessageEmbed()
            .setColor(ee.color)
            .setTitle(`Music Commands`)
            .setDescription(
              `*${client.commands
                .filter((cmd) => cmd.category === `Music`)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cmd) => {
                  return `\`${cmd.name}\``;
                })
                .join(", ")}*`
            );
          embeds.push(Music_Embed);

          return embeds.map((embed, index) => {
            return embed.setColor(ee.color).setFooter({
              text: `Page ${index + 1} / ${
                embeds.length
              }\nหากต้องการดูคำสั่ง Descriptions and Information พิมพ์: ${prefix}help [CMD NAME]`,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });
          });
        }
      } else if (commandopt) {
        if (!derescommand)
          return interaction.followUp({
            content:
              "ไม่มีคำสั่งในบอทที่มีชื่อ **" +
              commandopt +
              "**.",
            ephemeral: true,
          });

        if (derescommand) {
          let embed = new MessageEmbed()
            .setColor(ee.color)
            .setTitle(
              `${emoji.SUCCESS} \`${derescommand.name}\` Command Info ${emoji.SUCCESS}`
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields([
              {
                name: `${emoji.setup} Name`,
                value: derescommand.name
                  ? `> \`${derescommand.name}\``
                  : "  ** ไม่มีชื่อสำหรับคำสั่งนี้.  ** ",
              },
              {
                name: `${emoji.setup} Category`,
                value: derescommand.category
                  ? `> \`${derescommand.category}\``
                  : " ** ไม่มีหมวดหมู่สำหรับคำสั่งนี้. **",
              },
              {
                name: `${emoji.setup} Description`,
                value: derescommand.description
                  ? `\`\`\`\n ${derescommand.description} \`\`\``
                  : "```\nไม่มีคำอธิบายสำหรับคำสั่งนี้.```",
              },
              {
                name: `${emoji.setup} Need Permission`,
                value: derescommand.userPermissions
                  ? `\`\`\`\n ${derescommand.userPermissions} \`\`\``
                  : "```\n ไม่มีคำอธิบายสำหรับคำสั่งนี้.```",
              },
              {
                name: `${emoji.backup} Sub Commands`,
                value: derescommand.options
                  ? `\`\`\`\n ${
                      derescommand.options
                        .filter((cmd) => cmd.type === "SUB_COMMAND")
                        .map((cmd) => `${cmd.name}`)
                        .join(" , ") || `ไม่มีคำสั่งย่อยสำหรับคำสั่งนี้`
                    } \`\`\``
                  : "```\n ไม่มีคำสั่งย่อยสำหรับคำสั่งนี้.```",
              },
            ])
            .setFooter({
              text: ee.footertext,
              iconURL: ee.footericon,
            });

          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
});
