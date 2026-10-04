require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// متغيرات لتخزين بيانات الفعالية الحالية
let activeEvent = null;

client.once('ready', () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    
    // تسجيل الأوامر المائلة (Slash Commands)
    const commands = [
        {
            name: 'event-create',
            description: 'إنشاء فعالية جديدة وتحديد الجائزة',
            options: [
                { name: 'name', description: 'اسم الفعالية', type: 3, required: true },
                { name: 'prize', description: 'الجائزة أو النقاط', type: 3, required: true }
            ]
        },
        {
            name: 'event-end',
            description: 'إنهاء الفعالية الحالية واختيار فائز عشوائي'
        }
    ];
    
    client.application.commands.set(commands);
});

// التفاعل مع الأوامر المائلة
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'event-create') {
        const name = interaction.options.getString('name');
        const prize = interaction.options.getString('prize');

        if (activeEvent) {
            return interaction.reply({ content: '❌ هناك فعالية قائمة بالفعل! يجب إنهاؤها أولاً.', ephemeral: true });
        }

        activeEvent = {
            name: name,
            prize: prize,
            creator: interaction.user.id,
            participants: new Set()
        };

        const embed = new EmbedBuilder()
            .setTitle(`🎉 فعالية جديدة: ${name}`)
            .setDescription(`**الجائزة:** ${prize}\n\nاضغط على الزر بالأسفل للتسجيل والمشاركة!`)
            .setColor('#00ff00')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_event')
                .setLabel('🎯 تسجيل دخول / مشاركة')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'event-end') {
        if (!activeEvent) {
            return interaction.reply({ content: '❌ لا توجد فعالية نشطة حالياً لإنهائها.', ephemeral: true });
        }

        const participantsArray = Array.from(activeEvent.participants);

        if (participantsArray.length === 0) {
            activeEvent = null;
            return interaction.reply({ content: '🔒 تم إنهاء الفعالية، ولكن لم يشارك أحد فيها! 😢' });
        }

        // اختيار فائز عشوائي
        const winnerId = participantsArray[Math.floor(Math.random() * participantsArray.length)];
        
        const endEmbed = new EmbedBuilder()
            .setTitle(`🏁 انتهت الفعالية: ${activeEvent.name}`)
            .setDescription(`🏆 **الفائز المحظوظ:** <@${winnerId}>\n🎁 **الجائزة:** ${activeEvent.prize}\n\nتهانينا للفائز وحظاً أوفر للجميع في الفعاليات القادمة! ✨`)
            .setColor('#ffcc00')
            .setTimestamp();

        activeEvent = null; // إعادة تعيين الفعالية
        await interaction.reply({ embeds: [endEmbed] });
    }
});

// التفاعل مع ضغطات الأزرار (التسجيل)
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'join_event') {
        if (!activeEvent) {
            return interaction.reply({ content: '❌ انتهت هذه الفعالية ولم تعد تستقبل مشاركين.', ephemeral: true });
        }

        if (activeEvent.participants.has(interaction.user.id)) {
            return interaction.reply({ content: 'ℹ️ أنت مسجل بالفعل في هذه الفعالية!', ephemeral: true });
        }

        activeEvent.participants.add(interaction.user.id);
        await interaction.reply({ content: '✅ تم تسجيل مشاركتك بنجاح! بالتوفيق 🎯', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
      
