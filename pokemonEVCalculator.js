const PARTY_SIZE = 6;
const MAX_WILD = 3;
const MAX_EVS = 510;
const BERRY_VITAMIN = 10;
const GEN_4_BERRY = 110;
const VITAMIN_MAX = 100;
var POWER_ITEM_AMT = 8;
var MAX_STAT = 252;

$(document).ready(function () {
	repeatSection($("#wildPokemon1"), MAX_WILD);
	repeatSection($("#partyPokemon1"), PARTY_SIZE);
	$(".pokemonSelector option:not(:first-child)").hide();

	modifyNumPokemon($("#addPartyMember"), $("#removePartyMember"), "#partyPokemon", PARTY_SIZE);
	modifyNumPokemon($("#addWildPokemon"), $("#removeWildPokemon"), "#wildPokemon", MAX_WILD);

	updateGeneration();

	modifyEVsFromItems();
	modifyEVsFromWildPokemon();
	resetEVs();
});

/**
 * Clones the given section and inserts new hidden copies after it
 *
 * @param {JQuery Object} $id The Object to be cloned
 * @param {number} num The total number of sections (including the original)
 */
function repeatSection($id, num) {
	for (var i = num; i > 1; i--) {
		var $clone = $id.clone().prop("id", $id.prop("id").replace("1", i)).insertAfter($id);
		$clone.find("[id], [name], [for]").each(function () {
			$(this).prop("id", $(this).prop("id").replace("1", i));
			if ($(this).is("[name]")) $(this).attr("name", $(this).attr("name").replace("1", i));
			if ($(this).is("[for]")) $(this).attr("for", $(this).attr("for").replace("1", i));
		});
		$clone.children("legend").text($clone.children("legend").text().replace("1", i));
		$clone.hide();
	}
}

function modifyNumPokemon($add, $remove, pokemon, max) {
	var numPokemon = 1;
	$add.click(function () {
		if (numPokemon < max) {
			numPokemon++;
			$(pokemon + numPokemon).show();
			$(".pokemonSelector option:nth-child(" + numPokemon + ")").show();

			if (numPokemon == max) $add.attr("disabled", true);
			if (numPokemon > 1) $remove.attr("disabled", false);
		}
	});

	$remove.click(function () {
		if (numPokemon > 1) {
			resetPokemon(pokemon, numPokemon);

			$(pokemon + numPokemon).hide();
			$(".pokemonSelector option:nth-child(" + numPokemon + ")").hide();
			resetPokemonSelectors();
			numPokemon--;

			if (numPokemon == 1) $remove.attr("disabled", true);
			if (numPokemon < max) $add.attr("disabled", false);
		}
	});
}

function updateGeneration() {
	$("[name=gen]").change(function () {
		POWER_ITEM_AMT = $("[name=gen]:checked").val() >= 7 ? 8 : 4;
		MAX_STAT = $("[name=gen]:checked").val() >= 6 ? 252 : 255;

		if ($("#gen3").is(":checked")) {
			$(".powerItem").hide();
		} else {
			$(".powerItem").show();
		}

		if ($("[name=gen]:checked").val() < 5) {
			$("#feathers").hide();
		} else {
			$("#feathers").show();
		}
	});
}

function modifyEVsFromWildPokemon() {
	for (var i = 1; i <= MAX_WILD; i++) {
		$("#addEVs" + i).click(function () {
			var idNum = $(this).prop("id").slice(-1);

			$(".partyPokemon:visible").each(function () {
				var totalEVs = calculateTotalEVs($(this));
				var EVs = [
					parseInt($("#wildHP" + idNum).val()),
					parseInt($("#wildAtk" + idNum).val()),
					parseInt($("#wildDef" + idNum).val()),
					parseInt($("#wildSpA" + idNum).val()),
					parseInt($("#wildSpD" + idNum).val()),
					parseInt($("#wildSpe" + idNum).val()),
				];

				if (totalEVs < MAX_EVS) {
					EVs = calculateEVs(
						EVs,
						$(this).find(".item").val(),
						$(this).find(".pokerus").is(":checked")
					);

					$(this)
						.find(".stat")
						.each(function (i) {
							if (totalEVs + EVs[i] <= MAX_EVS) {
								totalEVs = addEVs($(this), EVs[i], totalEVs);
							} else {
								totalEVs = addEVs($(this), MAX_EVS - totalEVs, totalEVs);
							}

							if (totalEVs == MAX_EVS) {
								return false;
							}
						});
				}
			});
		});

		$("#removeEVs" + i).click(function () {
			var idNum = $(this).prop("id").slice(-1);

			$(".partyPokemon:visible").each(function () {
				var totalEVs = calculateTotalEVs($(this));
				var EVs = [
					parseInt($("#wildHP" + idNum).val()),
					parseInt($("#wildAtk" + idNum).val()),
					parseInt($("#wildDef" + idNum).val()),
					parseInt($("#wildSpA" + idNum).val()),
					parseInt($("#wildSpD" + idNum).val()),
					parseInt($("#wildSpe" + idNum).val()),
				];

				if (totalEVs > 0) {
					EVs = calculateEVs(
						EVs,
						$(this).find(".item").val(),
						$(this).find(".pokerus").is(":checked")
					);

					$(this)
						.find(".stat")
						.each(function (i) {
							if (totalEVs - EVs[i] >= 0) {
								totalEVs = removeEVs($(this), EVs[i], totalEVs);
							} else {
								totalEVs = 0;
								$(this).val(0);
							}

							if (totalEVs == 0) {
								return false;
							}
						});
				}
			});
		});
	}
}

function calculateTotalEVs($pokemon) {
	var totalEVs = 0;
	$pokemon.find(".stat").each(function () {
		totalEVs += parseInt($(this).val());
	});
	return totalEVs;
}

function calculateEVs(EVs, item, hasPokerus) {
	switch (item) {
		case "PowerWeight":
			EVs[0] += POWER_ITEM_AMT;
			break;
		case "PowerBracer":
			EVs[1] += POWER_ITEM_AMT;
			break;
		case "PowerBelt":
			EVs[2] += POWER_ITEM_AMT;
			break;
		case "PowerLens":
			EVs[3] += POWER_ITEM_AMT;
			break;
		case "PowerBand":
			EVs[4] += POWER_ITEM_AMT;
			break;
		case "PowerAnklet":
			EVs[5] += POWER_ITEM_AMT;
			break;
		case "MachoBrace":
			EVs = doubleEVs(EVs);
			break;
	}

	if (hasPokerus) EVs = doubleEVs(EVs);

	return EVs;
}

function doubleEVs(EVs) {
	EVs.forEach(function (val, i, arr) {
		arr[i] = val * 2;
	});
	return EVs;
}

function addEVs($stat, EVs, totalEVs) {
	if (parseInt($stat.val()) + EVs <= MAX_STAT) {
		$stat.val(parseInt($stat.val()) + EVs);
		totalEVs += EVs;
	} else {
		totalEVs += MAX_STAT - parseInt($stat.val());
		$stat.val(MAX_STAT);
	}

	return totalEVs;
}

function removeEVs($stat, EVs, totalEVs) {
	if (parseInt($stat.val()) - EVs >= 0) {
		$stat.val(parseInt($stat.val()) - EVs);
		totalEVs -= EVs;
	} else {
		totalEVs -= parseInt($stat.val());
		$stat.val(0);
	}

	return totalEVs;
}

function modifyEVsFromItems() {
	$("#giveBerry").click(function () {
		switch ($("#berry").val()) {
			case "Pomeg":
				giveBerry($("#partyHP" + $("#berryPokemon").val()));
				break;
			case "Kelpsey":
				giveBerry($("#partyAtk" + $("#berryPokemon").val()));
				break;
			case "Qualot":
				giveBerry($("#partyDef" + $("#berryPokemon").val()));
				break;
			case "Hondew":
				giveBerry($("#partySpA" + $("#berryPokemon").val()));
				break;
			case "Grepa":
				giveBerry($("#partySpD" + $("#berryPokemon").val()));
				break;
			case "Tamato":
				giveBerry($("#partySpe" + $("#berryPokemon").val()));
				break;
		}
	});

	$("#giveVitamin").click(function () {
		switch ($("#vitamin").val()) {
			case "HP Up":
				giveVitamin($("#partyHP" + $("#vitaminPokemon").val()));
				break;
			case "Protein":
				giveVitamin($("#partyAtk" + $("#vitaminPokemon").val()));
				break;
			case "Iron":
				giveVitamin($("#partyDef" + $("#vitaminPokemon").val()));
				break;
			case "Calcium":
				giveVitamin($("#partySpA" + $("#vitaminPokemon").val()));
				break;
			case "Zinc":
				giveVitamin($("#partySpD" + $("#vitaminPokemon").val()));
				break;
			case "Carbos":
				giveVitamin($("#partySpe" + $("#vitaminPokemon").val()));
				break;
		}
	});

	$("#giveFeather").click(function () {
		switch ($("#feather").val()) {
			case "Health":
				giveFeather($("#partyHP" + $("#featherPokemon").val()));
				break;
			case "Muscle":
				giveFeather($("#partyAtk" + $("#featherPokemon").val()));
				break;
			case "Resist":
				giveFeather($("#partyDef" + $("#featherPokemon").val()));
				break;
			case "Genius":
				giveFeather($("#partySpA" + $("#featherPokemon").val()));
				break;
			case "Clever":
				giveFeather($("#partySpD" + $("#featherPokemon").val()));
				break;
			case "Swift":
				giveFeather($("#partySpe" + $("#featherPokemon").val()));
				break;
		}
	});
}

function giveBerry($stat) {
	if (parseInt($stat.val()) > 0) {
		if ($("#gen4").is(":checked") && parseInt($stat.val()) > GEN_4_BERRY) {
			$stat.val(GEN_4_BERRY);
		} else if (parseInt($stat.val()) < BERRY_VITAMIN) {
			$stat.val(0);
		} else {
			$stat.val(parseInt($stat.val()) - BERRY_VITAMIN);
		}
	}
}

function giveVitamin($stat) {
	if ($("[name=gen]:checked").val() < 8) {
		if (parseInt($stat.val()) < VITAMIN_MAX) {
			if (parseInt($stat.val()) + BERRY_VITAMIN > VITAMIN_MAX) {
				$stat.val(VITAMIN_MAX);
			} else {
				$stat.val(parseInt($stat.val()) + BERRY_VITAMIN);
			}
		}
	} else {
		if (parseInt($stat.val()) + BERRY_VITAMIN > MAX_STAT) {
			$stat.val(MAX_STAT);
		} else {
			$stat.val(parseInt($stat.val()) + BERRY_VITAMIN);
		}
	}
}

function giveFeather($stat) {
	if (parseInt($stat.val()) < MAX_STAT) {
		$stat.val(parseInt($stat.val()) + 1);
	}
}

function resetEVs() {
	for (var i = 1; i <= PARTY_SIZE; i++) {
		$("#resetPartyPokemon" + i).click(function () {
			var idNum = $(this).prop("id").slice(-1);
			resetPokemon("#partyPokemon", idNum);
		});
	}

	for (var i = 1; i <= MAX_WILD; i++) {
		$("#resetWildPokemon" + i).click(function () {
			var idNum = $(this).prop("id").slice(-1);
			resetPokemon("#wildPokemon", idNum);
		});
	}
}

function resetPokemon(pokemon, id) {
	$(pokemon + id)
		.find("input[type='number']")
		.each(function () {
			$(this).val(0);
		});

	$(pokemon + id)
		.find("select")
		.prop("selectedIndex", 0);

	$(pokemon + id)
		.find(":checkbox")
		.prop("checked", false);
}

function resetPokemonSelectors() {
	$(".pokemonSelector").prop("selectedIndex", 0);
}
