// ----------------- BEGIN SmoothSlider functions -----------------
SmoothSlider = function() {}
SmoothSlider.Step = 0.5;
SmoothSlider.Steps = 511;

SmoothSlider.generateTable = function(mrange, step)
{
	var range = Math.round(mrange * 100);
	if (( range % 10 ) && (range != 8))
		range += ( range - (range % 10 ));
	
	print("GENERATING TABLE FOR: " + range + " => " + step);
	
	SmoothSlider.Range = range;

	// Clear Table with NaN's
	for (var i = 0; i <= SmoothSlider.Steps; i++)
		SmoothSlider.sliderTable[i] = NaN;
	
	
	var stepings = (range / step).toFixed(0);
	var pos = ((SmoothSlider.Steps-1)/2-1);
	var left = pos % stepings;
	var steps = (pos / stepings).toFixed(0);
	
	
	if ( steps <= 0 ) {
		print('Not Enough MIDI Steps...');
		return;
	}
	else {
		print("Steps = " + SmoothSlider.Steps + " stepings = " + steps + " steps=" + steps + " left=" + left);
	}
	
	for (var i = 0; i <= SmoothSlider.Steps; i++) {
		var q = (i - pos - 1);
		var perc;
		
		
		if ( Math.abs(q) < (left/2)) {
			perc = 0;
		}
		else {
			if ( q > 0)
				q = q - (left/2);
			else
				q = q + (left/2);
			
			perc = (q * (step / steps))
		}
		
		if ( perc < -range )
			perc = -range;
		else if ( perc > range )
			perc = range;
		
		SmoothSlider.sliderTable[i] = perc;
	}
	
}

SmoothSlider.regenerateTable = function(value)
{
	SmoothSlider.generateTable(value, SmoothSlider.Step);
}

SmoothSlider.init = function(id)
{
	// Generated externally
	SmoothSlider.sliderTable = new Array();
	SmoothSlider.generateTable(engine.getValue("[Channel1]", "rateRange"), SmoothSlider.Step);
	
	engine.connectControl("[Channel1]","rateRange","SmoothSlider.regenerateTable");
}

SmoothSlider.shutdown = function()
{
}

SmoothSlider.smooth = function(value)
{
	print("VALUE=" + value + " TABLE=" + SmoothSlider.sliderTable[value] + " RATE=" + SmoothSlider.sliderTable[value]);
	return SmoothSlider.sliderTable[value] / SmoothSlider.Range;
}

SmoothSlider.pitchShift = function(channel, control, value, status, group)
{
	var pitch = SmoothSlider.sliderTable[value];
	var rate = 0;
	
	
	if ( isNaN(pitch)) {
		print("USING DEFAULT VALUE FOR SMOOTH SLIDER !#@");
		rate = script.absoluteSlider(group, "rate", value, -2, 1);
	}
	else {
		rate = pitch / SmoothSlider.Range;
		
		print("Value[" + value + "] = " +  pitch + " / " + rate);
		engine.setValue(group, "rate", rate);
	}
}

// ----------------- END SmoothSlider functions -------------------

if (typeof print != 'function') {
	print = function(str) { console.log(str); }
	
	engine = function() {}
	engine.connectControl = function() {
		
	};
	engine.getValue = function() {
		return 0.1;
	};
	
	SmoothSlider.init();
	
	for (var i = 0; i < SmoothSlider.sliderTable.length; i++) {
		print("PITCH["+i+"] = " + SmoothSlider.sliderTable[i]);
	}
	
	print(JSON.stringify(SmoothSlider.sliderTable));
}
