
/*
 * DR.HUGO.CHIP8 v0.1
 * Copyright (c) 2013... Carl Palsson, palsson.carl@gmail.com
 */

//initiate a new chip8Core!

var chip8Core = function ()
{
	/* INTERNAL VALUES */
	this.imRunning = null;
	this.imPaused = null;
	this.imWaiting = null;
	this.paustest = 0;
	//********DISPLAY*****
	
	//-->Display Specifications
	this.displayWidth = 64;
	this.displayHeight = 32;
	this.debugOnline = false;
	//-->DEBUG
	this.cpuCycle = 0;
	//-->This is the VRAM (Video Ram);
	//-->VRAM is an array of made up of the display specifications in this case 64 * 32 = 2048
	this.display = new Array(this.displayWidth * this.displayHeight);
	this.renderFlag = null;
	//********MEMORY
	//-->Stored as ArrayBuffer
	//-->Memory size as follows
	//-->HEX = 0xFFF
	//-->DEC = 4095
	
	var TypedMemArray = new ArrayBuffer(0x1000) // HEX = 0x1000 DEC = 4096 
	
	//--> Create an Uint8Array from the Arraybuffer
	this.memory = new Uint8Array(TypedMemArray); 

	// keys
	
	//--> Create a dictionary object!
	
	this._aKeys = {     49: 0x1,  // 1
	                    50: 0x2,  // 2
	                    51: 0x3,  // 3
	                    65: 0x4,  // A
						87: 0x5,  // W
	                    68: 0x6,  // D
	                    52: 0x7,  // 4
	                    83: 0x8,  // S
	                    53: 0x9,  // 5
	                    83: 0xA,  // Insert
	                    72: 0xB,  // Delete
	                    70: 0xC,  // Home
	                    90: 0xD,  // End
	                    88: 0xE,  // PageUp
	                    67: 0xF,  // PageDown
	                    19: 0x10  // Pause/Break
	                };
	this.pressedKey =  new Object();
	
	//--> Store previous key that has been pressed!
	this.previousKey = 0;

	//**** CPU REGISTERS ******//
	//Program counter
	//this.pc = 0; //Must be initialized to 0x200;
	//Stack pointer
	this.sp = null;
	//Timers
	this.delayTimer = null;
	this.soundTimer = null;
	//Stack 
	this.stack = new Array(16);
	//"V" Register
	this.v = new Array(16);
	this.i = null;
	this.step = null;
	//GRAPHICS OUTPUT
	this.screen = null;
	//this.reset();
	
};

	chip8Core.prototype.setDrawingArea = function(drawingArea)
	{
 		this.screen = (drawingArea);
	}
	
	chip8Core.prototype.runTimers = function()
	{
		if(this.delayTimer > 0)
		{
			this.delayTimer--;
		}
		if(this.soundTimer > 0)
		{
			if (this.soundTimer == 1) {
                console.log("BEEEEPPP");
            }
			this.soundTimer--;
		}
	}

	chip8Core.prototype.reset = function()
	{
		 var i;
	
		for(i = 0; i < this.memory.length; i++)
			this.memory[i] = 0;
		
		for(i = 0; i < this.v.length; i++)
			this.v[i] = 0;

		for(i = 0; i < this.display.length; i++)
			this.display[i] = 0

		this.i = 0;
		this.sp = 0;
		this.step = 0;
		this.delaytimer = 0;	
		this.soundTimer = 0;
		//set program counter to correct position!
		this.pc = 0x200;
		//Set running status to false!
		this._imRunning = false;
		
		
	}

	chip8Core.prototype.initializeMem = function()
	{
		//First emput RAM
		
		for(i = 0; i < this.memory.length; i++)
			this.memory[i] = 0;		

		//THEN LOAD HEX SPRITES!
		var hexsprites = [
              		0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
          		    0x20, 0x60, 0x20, 0x20, 0x70, // 1
            		0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
              		0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
              		0x90, 0x90, 0xF0, 0x10, 0x10, // 4
              		0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
              		0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
              		0xF0, 0x10, 0x20, 0x40, 0x40, // 7
              		0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
              		0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
              		0xF0, 0x90, 0xF0, 0x90, 0x90, // A
              		0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
              		0xF0, 0x80, 0x80, 0x80, 0xF0, // C
              		0xE0, 0x90, 0x90, 0x90, 0xE0, // D
              		0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
              		0xF0, 0x80, 0xF0, 0x80, 0x80  // F
          	];
		
		for(i = 0;i < hexsprites.length;i++)
		{
			this.memory[i] = hexsprites[i];
		}

	}

	chip8Core.prototype.start = function()
	{
	
		var i =0;
		//--> Check if a renderer i specified! 
		if(!this.screen)
			return
			
		this.imRunning = true;		
		
			var self = this
			
			requestAnimationFrame(function me()
			{	
				for (var i = 0; i < 10; i++) {
					if(self.imRunning)
					{
						self.emuCycle();
					}
				 }//-->End for
				
				if(self.renderFlag)
				{
					self.screen.renderScreen(self.display);
					self.renderFlag = false;
								
				}//-->End Screenrenderer
				
				  if ( ! (self.step++ % 2)) {
                self.runTimers();	
             }
				
			
			requestAnimationFrame(me);
			
			}); //-->End RequestAnimFrame
			
	}
	
	
	
	
	chip8Core.prototype.stop = function()
	{	   var buttonRun = document.getElementById('run');	
			buttonRun.disabled = false;
			this.imRunning = false;
			var div = document.getElementById('debug');
			div.innerHTML = "";
			this.cpuCycle = 0;
			var debug = document.getElementById('cycle');
			debug.innerHTML = 0;
			}
	
	
	
	
	chip8Core.prototype.ministop = function()
	{
		this.imRunning = false;
	}
	chip8Core.prototype.fetchRom = function(romToGet)
	{
		

	}

	chip8Core.prototype.loadRomIntoMem = function(program)
	{		
         // Load program into memory
			for (i = 0; i < program.length; i++) {
             this.memory[i + 0x200] = program[i];
         }
			
	}
	
	chip8Core.prototype.writeDebug = function(debugstring)
	{
		if(this.debugOnline)
		{
			var div = document.getElementById('debug');
			div.innerHTML = div.innerHTML + debugstring + "<br>";
		}
	}
	chip8Core.prototype.writeCycle = function(debugstring)
	{
		var div = document.getElementById('cycle');
		div.innerHTML = debugstring;
	}
	
	chip8Core.prototype.setKey = function(keyEvent)
	{
		var keyFromDict = this._aKeys[keyEvent]
		this.pressedKey[keyFromDict] = true;
	}
	
	chip8Core.prototype.unSetKey = function(keyEvent)
	{
		var keyFromDict = this._aKeys[keyEvent]
		delete this.pressedKey[keyFromDict];
	}

	chip8Core.prototype.emuCycle = function()
	{
		
		//-->Read OPERATION CODE FROM MEMORY
		//-->To create a workable example lets assume the following
		//-->1# OPCODE this.pc = 0xA2 --> HEX = 0xA2 BINARY = 10100010
		//-->2# OPCODE this.pc = 0xF0 --> HEX = 0xF0 BINARY = 11110000
		//-->SHIFTING:     0xA2 << 8 = 0xA200
		//-->We then shift 8bits left which in gives us this
		//-->HEX = 0xA200 and in BINARY the following
		//-->BINARY = old(10100010) + new(00000000) = 1010001000000000
		//-->We added 8 zeroes to the OPCODE we shifted everything to the left
		//-->Hence the shifting of 8bits to the left, now we have eight new zeroes to store data in
		//-->We then use the byte operator OR "|", this is important since we mean to add the 2# OPCODE
		//-->To the first one, that is why we added all the zeroes.
		//-->Using the OR operator will give us our result!
		//--> 1# OPCODE 1010001000000000 HEX 0xA200
		//--> 2# OPCODE         11110000 HEX   0xF0
		//--> MERGE WITH OR OPERATOR
		//--> M# OPCODE 1010001011110000 HEX 0xA2F0
		//
		var opCode = this.memory[this.pc] << 8 | this.memory[this.pc +1];
		//this.writeDebug(opCode);
		//--> As we merge two bytes into one opCode we will have to increase the program counter(this.pc) by two for every cycle!
		this.pc += 2;
		var demaskedOpCodeOne  = (opCode & 0xF000);
	    var X = (opCode & 0x0F00) >> 8;
		var Y  = (opCode & 0x00F0) >> 4;
		var hexOpCode = opCode.toString(16);
		this.writeDebug("Cycle: " + this.cpuCycle + " OPCODE: " + hexOpCode)
		this.cpuCycle++; 
		this.writeCycle(this.cpuCycle);
		//this.writeDebug("DEC first nibble:" + demaskedOpCodeOne + "DEC second nibble:" + demaskedOpCodeTwo  + "DEC third nibble:" + demaskedOpCodeThree  + "DEC fourth nibble:" + demaskedOpCodeFour);
		//this.writeDebug("DEC first nibble:" + hexCodeOne + "DEC second nibble:" + hexCodeTwo  + "DEC third nibble:" + hexCodeThree  + "DEC fourth nibble:" + hexCodeFour);
	
		switch(demaskedOpCodeOne)
		{
			case 0x0000:
				//alert("0");

				switch(opCode)
				{
				 case 0x00E0:
				 this.screen.clear(8);
				  
				 for (var i = 0; i < this.display.length; i++) {
                        this.display[i] = 0;
                 }
			
				 break;
				 
				 case 0x00EE:
				 
					this.pc = this.stack[--this.sp];
					this.writeDebug("PC: " + this.pc);
				 break;
				}
				
				break;
			
			case 0x1000:
				//alert("1");
				
				//-->OPCODE TABLE SAYS JUMP TO ADRESS OF XNNN
				//--> We need to mask out the NNN from our opcode, easiest way is to MASK it with the AND "&" operator as we target 
				//--> the three leftmost Nibbles mask it by doing 0x0FFF, this will sett everything in the first nibble to zero 
				/*
				myOP = opCode & 0x0FFF;
				yourOP = opCode & 0xFFF;
				var str = myOP.toString(16)
				var stra = yourOP.toString(16)
				alert("my" + str + "your" + stra);
				*/
				
				//--> You might aswell do this like this
				//--> this.pc = opcode & 0xFFF;
				//--> But for the sake of being clear I want to stick with the 0x0FFF approach, makes it easier to understand.
				this.pc = opCode & 0x0FFF;
				this.writeDebug("PC: " + this.pc);
				break;
				
			case 0x2000:
				//alert("2");
			
				//-->  2NNN	Calls subroutine at NNN.
				//--> Here the 2 in code is already decoded, we must fin the value of the NNN
				
				var NNN = opCode & 0x0FFF;
				this.stack[this.sp] = this.pc;
				this.sp++;
				this.pc = NNN;
				this.writeDebug("PC: " + this.pc);
				break;
			case 0x3000:
				//alert("3");
				//--> 3XNN	Skips the next instruction if VX equals NN.
				//--> What this means is that we will have to check V register at X place for a value which in this case is provided by NN
				//--> First lets decode the X
				//var X = opCode & 0x0F00;
				//--> Now lets get the value
				
				//--> Do the instruction evaluation
				//--> Check if VX is the same as NN if so skip next instruction
				if (this.v[X] === (opCode & 0xFF)) {
                     this.pc += 2;
                 }
				
				this.writeDebug("PC: " + this.pc);
				break;
			case 0x4000:
			if (this.v[X] != (opCode & 0x00FF)) {
                     this.pc += 2;
                 }
			//var opco = opCode.toString(16);
			//this.writeDebug("NOT IMPLEMENTED OPCODE= in 4 region" + opco)
			//	alert("4");
				break;
			case 0x5000:
			//	alert("5");
			
			
			 if (this.v[X] === this.v[Y]) {
                     this.pc += 2;
                 }
		//	var opco = opCode.toString(16);
		//	this.writeDebug("NOT IMPLEMENTED OPCODE= in 5 region" + opco)
				break;
			case 0x6000:
			
				//--> 6XNN	Sets VX to NN.
				//--> OPCODE Decoding, as you can see we already decoded the first part "6"XNN
				//--> Next thing is to decode the X part which is done by masking with AND "&"
				//--> by "ANDING" 0x0F00 you mask out the X part of 6XNN.  
				//--> the instruction tells us to add NN to X which we easily do by masking out NN
				//--> from 6XNN. To to that create another bit mask "0X00FF" use the AND "&" operator then assign the value
				//--> to X. Solution: opcode & 0x00FF
				
			//	alert("6");
				
				//var x = opCode & 0x0F00
				this.v[X] = opCode & 0xFF
				this.writeDebug("PC: " + this.pc);
				break;
			case 0x7000:
			//	alert("7");
				//-->7XNN Adds NN to VX.
				
				var NN = opCode & 0x00FF;
				//var x  = opCode & 0x0F00;
				
				var vRegVal = this.v[X];

				var vSum = vRegVal + NN; 
				
				//alert(vSum);
				
				if(vSum > 255)
				{
					vSum -= 256;
				}
				
				this.v[X] = vSum;
				
				this.writeDebug("PC: " + this.pc);
				break;
			case 0x8000:
			
			//-->Get OPCODE HEX value!
			var opco = opCode.toString(16);
		
			
				switch(opCode & 0x000F)
				{
					case 0x0000:
					//-->Sets VX to the value of VY.
						this.v[X] = this.v[Y];

					break;

					case 0x0001:
						
						this.v[X] |= this.v[Y];
					break;
					
					case 0x0002:
					this.v[X] &= this.v[Y];
					
					break;
					
					case 0x0003:
						this.v[X] ^= this.v[Y];
	
					break;
					
					case 0x0004:
						var val = this.v[X] + this.v[Y];
						if (val > 255) {
							val -= 256;
							this.v[0xF] = 1;
						} else this.v[0xF] = 0;

						this.v[X] = val;
					break;
					
					case 0x0005:
						
						
						//SUB Vx, Vy
						//Set Vx = Vx - Vy, set VF = NOT borrow.
						//If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
						if((this.v[X] > this.v[Y]) > 0)
						{
							this.v[0xF] = 1;
						}
						else 
						{
							this.v[0xF] = 0;
						}
						
						if(this.v[X] < 0)
						{
							this.v[x] += 256;
                        
						}
						this.v[X] = (this.v[X] - this.v[Y])
					break;
					
					case 0x0006:
						
						if((this.v[X] & 0x1) == 1)
						{
							this.v[0xF] = 1;
						}
						else
						{
							this.v[0xF] = 0;
						}
						
						this.v[X] = this.v[X] / 2;

					break;
					
					case 0x0007:
						
						var valueOfV = (this.v[Y] - this.v[X]);
						
						if(valueOfV > 0)
						{
							this.v[0xF] = 1;
						}
						else
						{
							this.v[0xF] = 0;
						}
						if(valueOfV < 0)
						{
							valueOfV += 256
						}
						
						this.v[X] = valueOfV;

					break;
                    case 0x000E:
					 
					 		
					 // SHL Vx, Vy
                     // 8xyE
                     // Set Vx equal to Vx SHL 1.
				   
					if((this.v[X] & 0x80) == 1)
					{
						this.v[0xF] = 1;
					}
					else
					{
						this.v[0xF] = 0;
					}
						
					var valueOfV = this.v[X] * 2;
					
					if(valueOfV > 255)
					{
						valueOfV -= 256;
					}
					
					this.v[X] = valueOfV;
						
					break;

				}
			
			
			
			//	alert("8");
				break;
			case 0x9000:

			//-->9XY0	Skips the next instruction if VX doesn't equal VY.
			
			//var X = opCode & 0x0F00;
			//var Y = opCode & 0x00F0;
			
			if(this.v[X] != this.v[Y])
			{
				this.pc += 2;
			}
			//	alert("9");
			this.writeDebug("PC: " + this.pc);
				break;
			case 0xA000:
			//	alert("A");
				
				//--> ANNN	Sets I to the address NNN.
				//--> Mask out NNN from ANNN by using bit operator AND
				//--> bit mask looks like this 0x0FFF use the AND  "&" operator on the opcode
				this.i = opCode & 0x0FFF
				this.writeDebug("PC: " + this.pc);
				break;
			case 0xB000:
			
			this.pc = (opcode & 0xFFF) + this.v[0];
		//	var opco = opCode.toString(16);
		//	this.writeDebug("NOT IMPLEMENTED OPCODE in B region=" + opco)
			//	alert("B");
				break;
			case 0xC000:
			var opco = opCode.toString(16);
			var rNumber = Math.floor(Math.random() * 0xFF) & (opCode & 0x00FF);
			this.v[X] = rNumber;
			
			
		
			//	alert("C");
				break;
			case 0xD000:
			//	alert("D");
				//--> The carry flag (VF) is set to 1 if any screen pixels are flipped from set to unset when a sprite is drawn and set to 0 otherwise.
				//--> Therefore we need to set it to 0 at the beginning	
				//--> Wikipedia instruction for OPCODE DXYN
				//--> Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels. 
				//--> Each row of 8 pixels is read as bit-coded (with the most significant bit of each byte displayed on the left) starting from memory location I; I value doesn't change after the execution of this instruction. As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn't happen.
				
				
			/*
				this.v[0xF] = 0;
				//--> Now we need to set the height by looking at N
				
				var height = opCode & 0x000F;
				//var xx = opCode & 0x0F00;
				//var yy = opCode & 0x00F0;
				var regX = this.v[X];
				var regY = this.v[Y];
				var x,y,theSprite;
				
				for(y = 0; y < height; y++)
				{
					//--> Load the sprite from memory with adresses taken from I register
					theSprite = this.memory[this.i + y];
					
					for(x = 0; x < 8; x++)
					{
						//--> Use the loop to look for bits that are 1
						//--> Every increment bits are shifted to the right
						//--> Then the sprite is ANDED with the bit mask
						//--> Giving us a loop that test every bit if it's 1 or 0 						
						if((theSprite & (0x80 >> x) != 0))
						{
							
							//--> TODO IMPLEMENT THE SET PIXEL FUNCTION
							//--> Call the spriteDrawer function to add 
							//--> pixels 
							if(this.spriteDrawer(regX + x, regY + y))
							{
								this.v[0xF] = 1;
							}
						}
					}
					
					this.renderFlag = true
					
				}
				
			*/
			
					this.v[0xF] = 0;

                 var height = opCode & 0x000F;
                 var registerX = this.v[X];
                 var registerY = this.v[Y];
                 var x, y, spr;
					
				//First we need to loop Y times in order to get the height of the sprite					
                 for (y = 0; y < height; y++) {
				 //Load the sprite from the memory, I has already been by an earlier operation!
                     spr = this.memory[this.i + y];
				 //Now we need to loop through all 8 bits, this is done by placing creating a bit mask of 1000,0000(0x80) and then ANDING
				 //
					 
                     for (x = 0; x < 8; x++) {
                         if ((spr & 0x80) > 0) {
                             if (this.spriteDrawer(registerX + x, registerY + y)) {
                                 this.v[0xF] = 1;
                             }
                         }
                         spr <<= 1;
                     }
                     this.renderFlag = true;
                 }

				this.writeDebug("PC: " + this.pc);
				break;
			case 0xE000:
			var opco = opCode.toString(16);
			
				switch(opCode & 0x00FF)
				{
				
					case 0x009E:
					
							if(this.pressedKey[this.v[X]])
							{
								this.pc +=2;
							}
					this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x00A1:
					//--> EXA1	Skips the next instruction if the key stored in VX isn't pressed.
						if(!this.pressedKey[this.v[X]])
						{
							this.pc +=2;
						}
					this.writeDebug("PC: " + this.pc);
					break;
				
				}
		
			//	alert("E");
				break;
			case 0xF000:
			//	alert("F");
				
				//OPCODE THAT will get here looks like this FXNN where X is the position in the V register and NN is the 1bit value.
				//--> We have decoded the first nibble to an F
				//--> Now we must figure out what X is in the opcode
				//--> As we already done a couple of times we bitmask the X part of the opcode with the AND operator to get it's value
				//var x = opCode & 0x0F00;
				
				//--> Now we have X we must find out the rest of the opCode, this time we bit mask the FXNN
				switch(opCode & 0x00FF)
				{
					case 0x0007:

					//-->  FX07	Sets VX to the value of the delay timer.
					//var X = opCode & 0x0F00;
					this.v[X] = this.delayTimer;
					this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x000A:
					var keyBind = this.setKey;
					var me = this;
					
					this.setKey = function(key)
					{
						me.v[X] = key;
						me.setKey = keyBind.bind(me);
						me.setKey.apply(me, arguments);
						this.start();
						
					}
					this.stop();
					
					this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0015:
					//--> FX15	Sets the delay timer to VX.
					//var X = opCode & 0x0F00;
					this.delayTimer = this.v[X];
					this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0018:
			
					this.soundTimer = this.v[X];
						this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x001E:
				
					this.i += this.v[X];
					this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0029:
					//Here we set I to VX then we multiply with 5 as every sprite is five rows long.
					this.i = this.v[X] * 5;
						this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0033:
					
						//Fx33 - LD B, Vx
						//Store BCD representation of Vx in memory locations I, I+1, and I+2.
						var vValue = this.v[X]
						
						for(var i = 3; i > 0; i--)
						{
								this.memory[this.i + i - 1] = parseInt(vValue % 10);
								vValue /= 10;
						}
						
							this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0055:
				
	
						
					//	Fx55 - LD [I], Vx
					//Store registers V0 through Vx in memory starting at location I.
					
					for(var i = 0; i <= X; i++)
					{
						this.memory[this.i + i] = this.v[i]
					}
						this.writeDebug("PC: " + this.pc);
					break;
					
					case 0x0065:
				
							
						for (var i = 0; i <= X; i++) {
                             this.v[i] = this.memory[this.i + i];
                         }
					this.writeDebug("PC: " + this.pc);	 
					break;
					
					default:
					var hexx = opCode & 0x00FF;
					alert("unknown F based opcode" + hexx.toString(16));
				
				
				
				}
			
			
				break;
			 default:
			 
             alert("Unknown opcode " + demaskedOpCodeOne + " passed. Terminating.");
		}
		
			this.paustest += 1;
			//if(this.paustest == 250)
			//{
			//	this.imRunning = false;	
			//}
			
	}
	
	chip8Core.prototype.spriteDrawer = function (xPos, yPos)
	{
	
	     var location,
            width = this.getWidth(),
            height = this.getHeight();

        // If the pixel exceeds the dimensions,
        // wrap it back around.
      if(xPos > width){
			xPos -= width;
		} else if(xPos < 0)	{
			xPos += width;
		}

        if (yPos > height) {
            yPos -= height;
        } else if (yPos < 0) {
            yPos += height;
        }

        location = xPos + (yPos * width);

        this.display[location] ^= 1;

        return !this.display[location];
	/*
		     var location,
            width = this.getWidth(),
            height = this.getHeight();

		
		//--> Check the screen size so we don't draw outside
		
		if(xPos > width){
			xPos -= width;
		} else if(xPos < 0)	{
			xPos += width;
		}
		
		if(yPos > height){
			yPos -= height;
		}
		//felet låg här!!!! 0 STÖRRE ÄN YPOS!!!
		else if(yPos > 0){
			yPos += height;
		}
		
		location = xPos + (yPos * width);
		
		//--> Now we need to flip the bits on that location
		//--> This is done by using the XOR(exclusive or)
		//--> the syntax looks like this ^= 
		//--> XOR (^) TRUTHTABLE
		//-->	a	b	a^b
		//-->	0	0	0
		//-->	0	1	1
		//-->	1	0	1
		//-->	1	1	0
		//--> With this in mind you can see that by using XOR you can compare
		//--> bits to see if it has changed since last draw.

		
		this.display[location] ^= 1;
		
		return !this.display[location];
		*/
	}
	chip8Core.prototype.getWidth = function()
	{
		return this.displayWidth;
	}

	chip8Core.prototype.getHeight = function()
	{
		return this.displayHeight;
	}

//******HTML RENDERER
//--> Create the html renderer aswell as adding it's prototypes


var HtmlRenderer = function(canvasName, width, height, scale)
{
	this.canvas = document.getElementById(canvasName);
	this.ctx = this.canvas.getContext("2d");
  //  this.canvas = canvas;
    this.width = +width;
    this.height = +height;
	this.lastRenderedData = [];
    this.setScale(scale);
	this.lastDraw = 0;
	this.draws = 0;

    this.fgColor = "#FF0000";
    this.bgColor = "transparent";
	/*
	
	this.context = this.canvas.getContext("2d");
	this.width = width;
	this.height = height;
	this.setScale(scale);
	this.lastDrawnData = new Array();
	this.lastRender = 0;
    this.renders = 0;
  	this.fgColor = "#0f0";
    this.bgColor = "transparent";
*/
};

	HtmlRenderer.prototype.setScale = function(scale)
	{
		this.scale = scale;
		this.canvas.width = scale * this.width;
		this.canvas.height = scale * this.height;
	}
	
	HtmlRenderer.prototype.clear = function()
	{
		this.ctx.clearRect(0,0,this.width * this.scale,this.height * this.scale);	
	
	}

	HtmlRenderer.prototype.renderScreen = function(display)
	{
		this.clear();
		this.lastRenderedData = display;
        var i, x, y;
        for (i = 0; i < display.length; i++) {
              x = (i % this.width) * this.scale;
              y = Math.floor(i / this.width) * this.scale;

            this.ctx.fillStyle = [this.bgColor, this.fgColor][display[i]];
            this.ctx.fillRect(x, y, this.scale, this.scale);
        }

		this.draws++;

	}

