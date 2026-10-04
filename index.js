require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');

// إنشاء عميل البوت مع الصلاحيات المطلوبة
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// متغيرات مؤقتة لتخزين بيانات الفعالية الحالية
let activeEvent = null;
let participants = [];

client.once('ready', async () => {
    console.log(`[BOT] تم تشغيل البوت بنجاح باسم: \${client.user.tag}`);
    
    // تسجيل أوامر السلاش (Slash Commands) تلقائياً عند التشغيل
    const commands = [
        new SlashCommandBuilder()
            .setName('start-event')
            .setDescription('بدء فعالية جديدة وسجل المشاركين')
            .addStringOption(option => option.setName('title').setDescription('عنوان الفعالية').setRequired(true))
            .addStringOption(option => option.setName('prize').setDescription('جائزة الفعالية').setRequired(true)),
        new SlashCommandBuilder()
            .setName('join')
            .setDescription('انضم إلى الفعالية الحالية المفتوحة'),
        new SlashCommandBuilder()
            .setName('end-event')
            .setDescription('إنهاء الفعالية واختيار فائز عشوائي من المشاركين')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('[BOT] جاري تحديث أوامر السلاش الخاص بالبوت...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[BOT] تم تفعيل أوامر السلاش بنجاح في جميع السيرفرات!');
    } catch (error) {
        console.error('[ERROR] فشل تسجيل الأوامر:', error);
    }
});

// التفاعل مع أوامر السلاش
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'start-event') {
        const title = interaction.options.getString('title');
        const prize = interaction.options.getString('prize');

        activeEvent = { title, prize };
        participants = [];

        const embed = new EmbedBuilder()
            .setTitle('🎉 فعالية جديدة بدأت!')
            .setDescription(`**الفعالية:** \({title}\n**الجائزة:** 🎁 \){prize}\n\nللمشاركة في الفعالية، اكتب الأمر التالي: \`/join\``)
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'join') {
        if (!activeEvent) {
            return await interaction.reply({ content: '❌ لا توجد فعالية نشطة حالياً للإنضمام إليها!', ephemeral: true });
        }

        if (participants.includes(interaction.user.id)) {
            return await interaction.reply({ content: '⚠️ أنت مسجل بالفعل في هذه الفعالية!', ephemeral: true });
        }

        participants.push(interaction.user.id);
        await interaction.reply({ content: `✅ تم تسجيل انضمامك بنجاح للفعالية يا <@${interaction.user.id}>! عدد المشاركين الحالي: ${participants.length}`, ephemeral: false });
    }

    else if (commandName === 'end-event') {
        if (!activeEvent) {
            return await interaction.reply({ content: '❌ لا توجد فعالية نشطة لإنهائها!', ephemeral: true });
        }

        if (participants.length === 0) {
            activeEvent = null;
            return await interaction.reply({ content: '📉 تم إغلاق الفعالية بسبب عدم انضمام أي مشاركين.' });
        }

        // اختيار فائز عشوائي
        const winnerId = participants[Math.floor(Math.random() * participants.length)];
        const eventTitle = activeEvent.title;
        const prizeMoney = activeEvent.prize;

        activeEvent = null;
        participants = [];

        const endEmbed = new EmbedBuilder()
            .setTitle('🏁 انتهت الفعالية!')
            .setDescription(`**اسم الفعالية:** ${eventTitle}\n\n🏆 **الفائز المحظوظ هو:** <@${winnerId}>\n🎁 **الجائزة:** ${prizeMoney}\n\nمبارك للفائز وحظ أوفر للبقية في الفعاليات القادمة! ✨`)
            .setColor('#ff9900')
            .setTimestamp();

        await interaction.reply({ embeds: [endEmbed] });
    }
});

// تسجيل دخول البوت باستخدام التوكن السري
client.login(process.env.DISCORD_TOKEN);


// ==========================================
// 🌐 كود خادم الويب الوهمي للحصول على استضافة Render المجانية
// ==========================================
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Event Master Bot is Online and Running Safely 24/7!');
});

app.listen(port, () => {
    console.log(`[SERVER] خادم الويب يعمل بنجاح ومستعد لاستقبال الـ Port عبر المنفذ: ${port}`);
});
        
