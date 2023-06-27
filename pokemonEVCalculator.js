const PARTY_SIZE = 6;
const MAX_WILD = 3;
MAX_EVS = 510;
var powerItemAmount = 8;
var maxStat = 252;

$(document).ready(function () {
	repeatSection($("#wildPokemon1"), MAX_WILD);
	repeatSection($("#partyPokemon1"), PARTY_SIZE);

	modifyNumPokemon($("#addPartyMember"), $("#removePartyMember"), "#partyPokemon", PARTY_SIZE);
	modifyNumPokemon($("#addWildPokemon"), $("#removeWildPokemon"), "#wildPokemon", MAX_WILD);

	updateGeneration();

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

			if (numPokemon == max) $add.attr("disabled", true);
			if (numPokemon > 1) $remove.attr("disabled", false);
		}
	});

	$remove.click(function () {
		if (numPokemon > 1) {
			resetPokemon(pokemon, numPokemon);

			$(pokemon + numPokemon).hide();
			numPokemon--;

			if (numPokemon == 1) $remove.attr("disabled", true);
			if (numPokemon < max) $add.attr("disabled", false);
		}
	});
}

function updateGeneration() {
	$("[name=gen]").change(function () {
		powerItemAmount = $("[name=gen]:checked").val() >= 7 ? 8 : 4;
		maxStat = $("[name=gen]:checked").val() >= 6 ? 252 : 255;
	});
}

function modifyEVsFromWildPokemon() {
	for (var i = 1; i <= MAX_WILD; i++) {
		$("#addWild" + i).click(function () {
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

		$("#removeWild" + i).click(function () {
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
			EVs[0] += powerItemAmount;
			break;
		case "PowerBracer":
			EVs[1] += powerItemAmount;
			break;
		case "PowerBelt":
			EVs[2] += powerItemAmount;
			break;
		case "PowerLens":
			EVs[3] += powerItemAmount;
			break;
		case "PowerBand":
			EVs[4] += powerItemAmount;
			break;
		case "PowerAnklet":
			EVs[5] += powerItemAmount;
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
	if (parseInt($stat.val()) + EVs <= maxStat) {
		$stat.val(parseInt($stat.val()) + EVs);
		totalEVs += EVs;
	} else {
		totalEVs += maxStat - parseInt($stat.val());
		$stat.val(maxStat);
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

function resetEVs() {
	for (var i = 1; i <= PARTY_SIZE; i++) {
		$("#resetPokemon" + i).click(function () {
			var idNum = $(this).prop("id").slice(-1);
			resetPokemon("#partyPokemon", idNum);
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
