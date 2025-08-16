
# 📱 KTU Attendance Calculator  

Because KTU thinks you should spend your life calculating percentages instead of actually studying (or, you know, living). So I built an app that does the math for you.  

---

## 🎯 What This Does  

- Tells you your attendance percentage.  
- Tells you if you’re safe, screwed, or somewhere in between.  
- Tells you exactly how many classes you can bunk or need to attend.  

Basically, it saves you from begging faculty later.  

---

## ⚡ Features (a.k.a. Why You’ll Stop Using Your Calculator App)  

- **Branch-first setup** → Pick your branch → boom, subjects auto-load.  
- **Subject database** → All branches, all semesters, theory + labs. Yes, even those random labs nobody remembers.  
- **Real-time calculations** → No more “Bro, I think I have 75%… wait no 72%… wait I’m dead.”  
- **Targets** →  
  - 60% if you’re gambling on condonation.  
  - KTU’s official rules if you’re playing safe.  
  - 76–100% if you’re that person who plans 4D chess with attendance.  
- **Profiles** → Name, roll no, branch, semester, gender, PWD… all stored. Don’t worry, it’s local. Nobody cares enough to hack your attendance data.  
- **UI that doesn’t make your eyes bleed** → Clean design, smooth dropdowns, color-coded:  
  - Green = chill.  
  - Yellow = tension building.  
  - Red = good luck explaining to your HOD.  

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js v14+  
- npm / yarn  
- Expo CLI  
- Emulator OR Expo Go app  

### Steps  
```bash
git clone https://github.com/yourusername/ktu-attendance-calculator.git
cd ktu-attendance-calculator
npm install
npm start
````

Scan QR on Expo Go → done. If not, run `npm run android` or `npm run ios`.

---

## 📊 How To Use

1. Create profile → Subjects load for your branch + semester.
2. Set target → condonation, KTU default, or your overachiever goal.
3. Update attendance → watch your safe bunk count rise/fall.
4. Make smarter bunking decisions → thank me later.

---

## 🏗️ Under the Hood

* React Native + Expo → runs on both Android & iOS.
* AsyncStorage → keeps your data safe even if your phone dies.
* React Hooks → modern, clean state management.
* Dependencies you’ll end up installing anyway:

  * `@react-native-async-storage/async-storage`
  * `@react-native-community/slider`
  * `@react-native-picker/picker`

---

## 🎓 Tailor-made for KTU

* All branches (CS, EC, ME, CE, EE, …).
* S1–S8 covered.
* Matches KTU’s weird attendance rules exactly.
* Yes, even gender/PWD based minimums.

---

## 🔧 Customizing

* Want to add subjects? Edit `subjectsData.js`.
* Want to break rules (literally)? Change `evaluateSubject()` in `App.js`.

---

## 📄 License

MIT. Use it. Break it. Fork it. I don’t care.

---

## 🙏 Thanks (sort of)

* KTU → for making life complicated enough that this app is necessary.
* React Native & Expo → for doing the heavy lifting.
* Me → for making your attendance anxiety slightly less tragic.

---

**Made with just enough sarcasm to survive KTU.**

