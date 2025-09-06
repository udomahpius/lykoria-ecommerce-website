



text = input("Enter a text: ")
vowels = {'a': 0, 'e': 0, 'i': 0, 'o': 0, 'u': 0}
text = text.lower()
for char in text:
    if char in vowels:   
        vowels[char] += 1
print("\nVowel Frequencies:")
for vowel, count in vowels.items():
    print(f"{vowel}: {count}")
   