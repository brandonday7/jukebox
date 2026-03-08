#include "display.h"
#include "tests.h"


void runTestSuite() {
  bool pass = toMultilineTests();
  if (!pass) {
    Serial.println("toMultiline method tests failed!");
  }
}

bool toMultilineTests(bool printLines) {
    std::vector<String> lines;
    int testNum = 0;
    int passed = 0;
    int failed = 0;

    auto printResult = [&](bool condition) {
        testNum++;
        if (condition) {
            Serial.println("TEST " + String(testNum) + ": PASS");
            passed++;
        } else {
            Serial.println("TEST " + String(testNum) + ": FAIL");
            failed++;
        }
    };

    auto printLines_ = [&]() {
        if (printLines) {
            for (int i = 0; i < lines.size(); i++) {
                Serial.print("  line " + String(i) + ": *");
                Serial.print(lines[i]);
                Serial.println("*");
            }
        }
    };

    // TEST 1: Single line no overflow
    Serial.println("--- Single line no overflow ---");
    lines = toMultiline("hello world", 1);
    printLines_();
    printResult(lines.size() == 1 && lines[0] == "hello world");

    // TEST 2: Single word no overflow
    Serial.println("--- Single word no overflow ---");
    lines = toMultiline("hello", 1);
    printLines_();
    printResult(lines.size() == 1 && lines[0] == "hello");

    // TEST 3: Single word with overflow (longer than screen)
    Serial.println("--- Single word with overflow ---");
    lines = toMultiline("hellohellohellohellohellohellohellohellohellohellohellohellohellohello", 1);
    printLines_();
    printResult(lines.size() == 1 && lines[0].length() > 0 && lines[0].indexOf("...") != -1); 

    // TEST 4: Multi word with a long unbreakable word FAILED
    Serial.println("--- Long unbreakable word ---");
    lines = toMultiline("sdghjghgfsdfghjhfdsfghfdsfhggdsdfgh normal words", 2);
    printLines_();
    printResult(lines.size() <= 2 && lines[0].length() > 0 && lines[lines.size() - 1].indexOf("...") != -1);

    // TEST 5: Multi word (12 words) with numLines = 2
    Serial.println("--- 12 words, 2 lines ---");
    lines = toMultiline("one two three four five six seven eight nine ten eleven twelve", 2);
    printLines_();
    printResult(lines.size() == 2 && lines[0].length() > 0 && lines[1].length() > 0 && lines[lines.size() - 1].indexOf("...") != -1);

    // TEST 6: Multi word (12 words) with numLines = 10 FAIL
    Serial.println("--- 12 words, 10 lines ---");
    String test6Str = "one two three four five six seven eight nine ten eleven twelve";
    lines = toMultiline(test6Str, 10);
    printLines_();
    String test6StrResult = "";
    for (int i = 0; i < lines.size(); i++) {
      test6StrResult += lines[i] + " ";
    }
    test6StrResult.trim();
    printResult(lines.size() <= 10 && lines[0].length() > 0 && lines[lines.size() - 1].indexOf("...") == -1 && test6StrResult == test6Str);

    // TEST 7: Very long word second with normal words either side
    Serial.println("--- Very long word in middle ---");
    lines = toMultiline("hello sdghjghgfsdfghjhfdsfghfdsfhggdsdfgh world", 2);
    printLines_();
    printResult(lines.size() == 2 && lines[0].length() > 0 && lines[lines.size() - 1].indexOf("...") != -1);

    // TEST 8: Empty string
    Serial.println("--- Empty string ---");
    lines = toMultiline("", 2);
    printLines_();
    printResult(lines.size() == 0 || lines[0] == "");

    // SUMMARY
    Serial.println("**************RESULTS***************");
    Serial.println("Passed: " + String(passed) + "/" + String(testNum));
    Serial.println("Failed: " + String(failed) + "/" + String(testNum));

    if (failed != 0) {
      return false;
    }
    return true;
}