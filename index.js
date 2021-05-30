// Load discord
const delay = require('delay')
const Discord = require('discord.js')
const client = new Discord.Client()
// let channel = process.env.DISCORD_CHANNEL

// Other stuff
require('dotenv').config()
const vec3 = require('vec3')
const Prefix = process.env.MINECRAFT_PREFIX

// Load mineflayer
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { Movements, goals: { GoalNear }, goals } = require('mineflayer-pathfinder')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const collectBlock = require('mineflayer-collectblock').plugin
const pvp = require('mineflayer-pvp').plugin
const armorManager = require('mineflayer-armor-manager')
const autoeat = require('mineflayer-auto-eat')
const navigatePlugin = require('mineflayer-navigate')(mineflayer)


// if (process.argv.length < 1 || process.argv.length > 1) {
//   console.log('Usage : node index.js <host>')
//   process.exit(1)
// }

const bot = mineflayer.createBot({
  host: process.env.SERVER_ADDRESS,
  // host: process.argv[1],
  port: process.env.SERVER_PORT, // minecraft default port is 25565
  username: process.env.MINECRAFT_EMAIL ? process.env.MINECRAFT_EMAIL : 'inventory' ||'collector' || 'guard',
  password: process.env.MINECRAFT_PASSWORD
})

bot.on("login", () => {
  console.log("In Game Bot Online")
  // delay(1000)
  // bot.chat("/menu")
  // console.log("menu opened")
});

bot.on('windowOpen', (window) => {
  console.log('opening window')
  // delay(100)
  // bot.clickWindow(5, 1, 0)
  // console.log("Clicked on the item")
});

bot.on('windowClose', (window) => {
  console.log('closing window')
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

bot.on('chat', (username, message) => {
  const cmd = message.split(' ')
    if (cmd[0] === `${Prefix}say`){
      if (username != process.env.MINECRAFT_MASTER_USERNAME){
        bot.chat(`/w ${username} You cannot do that!`)
      } else {
          bot.chat(message.substring(Prefix.length + 4))
      }
    }
}) 

bot.on('chat', (username, message, player) => {
  const cmd = message.split(' ')[0]
  const command = message.split(' ')
     if (cmd === `${Prefix}help`){
      bot.chat(`${username}, You can find the list of commands here: https://github.com/Janlxrd/CrapBot#features`)
     }
     if (cmd === `${Prefix}a`){
         bot.chat(`/tpyes`)

     }
    
     
      if (cmd === `${Prefix}tpa`){
        if (username !== process.env.MINECRAFT_MASTER_USERNAME) return;
        bot.chat(`/tpa ${username}`)
      }
      if (cmd === `${Prefix}uuid`) {
         bot.chat(`, Your uuid is ${bot.players[username].uuid}!`,)
      }
      if (cmd === `${Prefix}ping`) {
          bot.chat(`Your ping is ${bot.players[username].ping}!`)
      }
      if (cmd === `${Prefix}tps`){
      bot.chat(`the current tps is\t` + bot.getTps)
      }
      if (cmd === `${Prefix}coords`){
          bot.chat(`my current coords are ${bot.entity.position}`)
      }
      if (cmd === `${Prefix}equiparmor`) {
        bot.armorManager.equipAll()
      }
      if (command[0] === `${Prefix}kill`){
        const player = bot.players[command[1]]
        if (!player){
          bot.chat("I can't find that player");
        } else {
          bot.chat(`Attempting to kill ${command[1]}`);
          setTimeout(() => {
            const sword = bot.inventory.items().find(item => item.name.includes('sword'))
            if (sword) bot.equip(sword, 'hand')
          }, 150)
            
          //   if (!sword) {
          //   const axe = bot.inventory.items().find(item => item.name.includes('axe'))
          //   if (axe) bot.equip(axe, 'hand')}
          // }, 150)
          }
          bot.pvp.attack(player.entity);
        }  
        if (command[0] === `${Prefix}craft`) {
          craftItem(command[2], command[1])
        }
        if (command[0] === `${Prefix}list`) {
          sayItems()
        }
        if (command[0] === `${Prefix}toss`) {
          tossItem(command[2], command[1])
        }
        // if (command[0] === `${Prefix}toss`) {
        //   tossItem(command[1])
        // }
        if (command[0] === `${Prefix}equip`) {
          equipItem(command[2], command[1])
        }
        if (command[0] === `${Prefix}unequip`) {
          unequipItem(command[1])
        }
        if (command[0] === `${Prefix}use`) {
          useEquippedItem()
        }
        if (command[0] === `${Prefix}tossall`) {
          tossAll()
        }
  });

// Load plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock);
bot.loadPlugin(pvp);
bot.loadPlugin(armorManager);
bot.loadPlugin(autoeat);
navigatePlugin(bot);

const RANGE_GOAL = 1 // get within this radius of the player

// Load mc data
let mcData
bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 14,
    bannedFood: ['spider_eye', 'rotten_flesh', 'pufferfish']
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message !== `${Prefix}come`) return
    const target = bot.players[username]?.entity
    // emitter.setMaxListeners(15)
    if (!target) {
      bot.chat("I don't see you !")
      return
    } else {
      bot.chat('Coming!')
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  })
  mineflayerViewer(bot, { port: 4868, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
  // setInterval(() => {
  //   setTimeout(() => {
  //       bot.look(Math.floor(Math.random() * Math.floor("360")), 0, true, null);
  //   }, getRandomInt(4 * 60) * 1000);

  //   setTimeout(() => {
  //       bot.swingArm("left");
  //   }, getRandomInt(5 * 60) * 1000);

  //   bot.setControlState('jump', true)
  //   bot.setControlState('jump', false)
  // },
  // getRandomInt(3 * 60) * 1000);
});

bot.on('health', () => {
  if (bot.food === 20) bot.autoEat.disable()
  // Disable the plugin if the bot is at 20 food points
  else bot.autoEat.enable() // Else enable the plugin again
})

function tossAll () {
  if (bot.inventory.items().length === 0) return
  const item = bot.inventory.items()[0]
  bot.tossStack(item, tossAll)
}

// Wait for someone to say something
bot.on('chat', (username, message) => {
  // If the player says something start starts with "collect"
  // Otherwise, do nothing
  const args = message.split(' ')
  if (args[0] !== `${Prefix}collect`) return

  // If the player specifies a number, collect that many. Otherwise, default to 1.
  let count = 1
  if (args.length === 3) count = parseInt(args[1])

  // If a number was given the item number is the 3rd arg, not the 2nd.
  let type = args[1]
  if (args.length === 3) type = args[2]

  // Get the id of that block type for this version of Minecraft.
  const blockType = mcData.blocksByName[type]
  if (!blockType) {
    bot.chat(`I don't know any blocks named ${type}.`)
    return
  }

  // Find all nearby blocks of that type, up to the given count, within 64 blocks.
  const blocks = bot.findBlocks({
    matching: blockType.id,
    maxDistance: 64,
    count: count
  })

  // Complain if we can't find any nearby blocks of that type.
  if (blocks.length === 0) {
    bot.chat("I don't see that block nearby.")
    return
  }

  // Convert the block position array into a block array to pass to collect block.
  const targets = []
  // emitter.setMaxListeners(15)
  for (let i = 0; i < Math.min(blocks.length, count); i++) {
    targets.push(bot.blockAt(blocks[i]))
  }

  // Announce what we found.
  bot.chat(`Found ${targets.length} ${type}(s)`)

  // Tell the bot to collect all of the given blocks in the block list.
  bot.collectBlock.collect(targets, err => {
    if (err) {
      // An error occurred, report it.
      bot.chat(err.message)
      console.log(err)
    } else {
      // All blocks have been collected.
      bot.chat('Done')
    }
  })
})

function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    bot.chat(output)
  } else {
    bot.chat('empty')
  }
}

function tossItem (name, amount) {
  amount = parseInt(amount, 10)
  const item = itemByName(name)
  if (!item) {
    bot.chat(`I have no ${name}`)
  } else if (amount) {
    bot.toss(item.type, null, amount, checkIfTossed)
  } else {
    bot.tossStack(item, checkIfTossed)
  }

  function checkIfTossed (err) {
    if (err) {
      bot.chat(`unable to toss: ${err.message}`)
    } else if (amount) {
      bot.chat(`tossed ${amount} x ${name}`)
    } else {
      bot.chat(`tossed ${name}`)
    }
  }
}

async function equipItem (name, destination) {
  const item = itemByName(name)
  if (item) {
    try {
      await bot.equip(item, destination)
      bot.chat(`equipped ${name}`)
    } catch (err) {
      bot.chat(`cannot equip ${name}: ${err.message}`)
    }
  } else {
    bot.chat(`I have no ${name}`)
  }
}

async function unequipItem (destination) {
  try {
    await bot.unequip(destination)
    bot.chat('unequipped')
  } catch (err) {
    bot.chat(`cannot unequip: ${err.message}`)
  }
}

function useEquippedItem () {
  bot.chat('activating item')
  bot.activateItem()
}

async function craftItem (name, amount) {
  amount = parseInt(amount, 10)
  const mcData = require('minecraft-data')(bot.version)

  const item = mcData.findItemOrBlockByName(name)
  const craftingTableID = mcData.blocksByName.crafting_table.id

  const craftingTable = bot.findBlock({
    matching: craftingTableID
  })

  if (item) {
    const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
    if (recipe) {
      bot.chat(`I can make ${name}`)
      try {
        await bot.craft(recipe, amount, craftingTable)
        bot.chat(`did the recipe for ${name} ${amount} times`)
      } catch (err) {
        bot.chat(`error making ${name}`)
      }
    } else {
      bot.chat(`I cannot make ${name}`)
    }
  } else {
    bot.chat(`unknown item: ${name}`)
  }
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function itemByName (name) {
  return bot.inventory.items().filter(item => item.name === name)[0]
}

let guardPos = null

function guardArea (pos) {
  guardPos = pos

  if (!bot.pvp.target) {
    moveToGuardPos()
  }
}

function stopGuarding () {
  guardPos = null
  bot.pvp.stop()
  bot.pathfinder.setGoal(null)
}

function moveToGuardPos () {
  const mcData = require('minecraft-data')(bot.version)
  bot.pathfinder.setMovements(new Movements(bot, mcData))
  bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z))
}

bot.on('stoppedAttacking', () => {
  if (guardPos) {
    moveToGuardPos()
  }
})

bot.on('physicTick', () => {
  if (!guardPos) return // Do nothing if bot is not guarding anything

  // Only look for mobs within 16 blocks
  const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
                    e.mobType !== 'Armor Stand' 

  const entity = bot.nearestEntity(filter)
  if (entity) {
    // Start attacking
    bot.pvp.attack(entity)
  }
})

bot.on('chat', (username, message) => {
  if (message === `${Prefix}guard`) {
    const player = bot.players[username]
    // emitter.setMaxListeners(15)

    if (!player) {
      bot.chat("I can't see you.")
      return
    }
    setTimeout(() => {
      const sword = bot.inventory.items().find(item => item.name.includes('sword'))
      if (sword) bot.equip(sword, 'hand')
      
      if (!sword) {
      const axe = bot.inventory.items().find(item => item.name.includes('axe'))
      if (axe) bot.equip(axe, 'hand')}
    }, 150)
    bot.chat('I will guard that location.')
    guardArea(player.entity.position)
  }

  if (message === `${Prefix}fight me`) {
    const player = bot.players[username]

    if (!player) {
      bot.chat("I can't see you.")
      return
    }

    bot.chat('Prepare to fight!')
    bot.pvp.attack(player.entity)
  }

  if (message === `${Prefix}stopguard`) {
    bot.chat('I will no longer guard this area.')
    stopGuarding()
  }
});


// Redirect Discord messages to in-game chat
client.on('message', message => {
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL)
  // Only handle messages in specified channel
  if (message.channel.id !== channel.id) return
  // Ignore messages from the bot itself
  if (message.author.id === client.user.id) return

  bot.chat(`[${message.member.user.tag}]: ${message.content}`)
})

// Redirect in-game messages to Discord channel
bot.on('chat', (username, message) => {
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL)
  // Ignore messages from the bot itself
  if (username === bot.username) return

  channel.send(`${username}: ${message}`)
})

// Login Discord bot
client.login(process.env.DISCORD_TOKEN)

client.on('ready', () => {
  console.log(`The discord bot logged in! Username: ${client.user.username}!`)
  channel = client.channels.cache.get(process.env.DISCORD_CHANNEL)
  if (!channel) {
    console.log(`I could not find the channel (${channel})!`)
    process.exit(1)
  }
})



bot.navigate.blocksToAvoid[132] = true // avoid tripwire
bot.navigate.blocksToAvoid[59] = false // ok to trample crops
bot.navigate.on('pathPartFound', function (path) {
  bot.chat('Going ' + path.length + ' meters in the general direction for now.')
})
// bot.navigate.on('pathFound', function (path) {
//   bot.chat('I can get there in ' + path.length + ' moves.')
// })
bot.navigate.on('cannotFind', function (closestPath) {
  bot.chat('unable to find path. getting as close as possible')
  bot.navigate.walk(closestPath)
})
bot.navigate.on('arrived', function () {
  bot.chat('I have arrived')
})
bot.navigate.on('interrupted', function () {
  bot.chat('Pathfinding interrupted')
})
// bot.on('chat', function (username, message) {
//   if (username === bot.username) return
//   const target = bot.players[username].entity
//   if (message === 'come') {
//     bot.navigate.to(target.position)
//   } else if (message === 'stop') {
//     bot.navigate.stop()
//   } else if (message === 'testcb') {
//     bot.chat('computing path to ' + target.position)
//     const results = bot.navigate.findPathSync(target.position)
//     bot.chat('status: ' + results.status)
//     bot.navigate.walk(results.path, function (stopReason) {
//       bot.chat('done. ' + stopReason)
//     })
//   } else {
//     const match = message.match(/^goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/)
//     if (match) {
//       const pt = vec3(
//         parseFloat(match[1], 10),
//         parseFloat(match[2], 10),
//         parseFloat(match[3], 10))
//       bot.navigate.to(pt)
//     } else {
//       console.log('no match')
//     }
//   }
// })
