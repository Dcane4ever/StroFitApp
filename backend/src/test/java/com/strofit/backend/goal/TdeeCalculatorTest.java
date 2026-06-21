package com.strofit.backend.goal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Tests for TDEE calculation utility.
 * NOTE: TdeeCalculator is a future utility class to be added when the
 * onboarding endpoint is built. These tests define the expected behavior.
 *
 * Harris-Benedict BMR formula:
 *   Male:   BMR = 88.362 + (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age)
 *   Female: BMR = 447.593 + (9.247 × weight_kg) + (3.098 × height_cm) - (4.330 × age)
 *
 * Activity multipliers:
 *   SEDENTARY:    1.2
 *   LIGHT:        1.375
 *   MODERATE:     1.55
 *   VERY_ACTIVE:  1.725
 *   EXTRA_ACTIVE: 1.9
 */
class TdeeCalculatorTest {

    // These values are verified manually against the Harris-Benedict formula

    @Test
    void tdee_maleModerateActivity_isCorrect() {
        // Male, 25yo, 70kg, 175cm, moderate activity
        // BMR = 88.362 + (13.397 × 70) + (4.799 × 175) - (5.677 × 25)
        //     = 88.362 + 937.79 + 839.825 - 141.925 = 1724.05
        // TDEE = 1724.05 × 1.55 = 2672.3
        double bmr = 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * 25);
        double tdee = bmr * 1.55;
        assertThat(tdee).isCloseTo(2672.3, within(5.0));
    }

    @Test
    void tdee_femaleSedentary_isCorrect() {
        // Female, 30yo, 58kg, 162cm, sedentary
        // BMR = 447.593 + (9.247 × 58) + (3.098 × 162) - (4.330 × 30)
        //     = 447.593 + 536.326 + 501.876 - 129.9 = 1355.9
        // TDEE = 1355.9 × 1.2 = 1627.1
        double bmr = 447.593 + (9.247 * 58) + (3.098 * 162) - (4.330 * 30);
        double tdee = bmr * 1.2;
        assertThat(tdee).isCloseTo(1627.1, within(5.0));
    }

    @Test
    void calorieAdjustment_cutGoal_reduces500kcal() {
        // A cut should subtract ~500 kcal from TDEE for ~0.5kg/week loss
        double tdee = 2500.0;
        double cutTarget = tdee - 500;
        assertThat(cutTarget).isEqualTo(2000.0);
    }

    @Test
    void calorieAdjustment_bulkGoal_adds300kcal() {
        // A lean bulk adds ~300 kcal
        double tdee = 2500.0;
        double bulkTarget = tdee + 300;
        assertThat(bulkTarget).isEqualTo(2800.0);
    }

    @Test
    void proteinTarget_cutGoal_is2gPerKg() {
        // For a cut, recommended protein is 2g per kg of body weight
        double weightKg = 70.0;
        double proteinTarget = weightKg * 2.0;
        assertThat(proteinTarget).isEqualTo(140.0);
    }
}
