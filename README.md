# KTU Attendance Calculator 📱

A comprehensive React Native mobile application designed specifically for KTU (APJ Abdul Kalam Technological University) students to efficiently track and calculate their attendance requirements.

## 🎯 Features

### Smart Attendance Tracking

- **Branch-First Selection**: Choose your engineering branch before semester for better organization
- **Comprehensive Subject Database**: Pre-loaded with all KTU subjects across all branches and semesters
- **Real-time Calculations**: Instant attendance percentage calculations and predictions

### Flexible Target Attendance Options

- **Condonation Eligibility**: 60% attendance for condonation
- **Minimum Required**: Dynamic calculation based on gender and PWD status
- **Custom Target**: Set any target between 76-100% for personal goals

### Advanced Profile Management

- **User Profile Setup**: Store name, roll number, branch, semester, gender, and PWD status
- **Data Persistence**: All data saved locally using AsyncStorage
- **Edit Functionality**: Modify subjects, add/remove subjects with duplicate prevention

### Intuitive User Interface

- **Modal-based Selections**: Smooth dropdown experience for all inputs
- **Clean Material Design**: Modern UI with consistent styling
- **Responsive Layout**: Optimized for various screen sizes
- **Visual Status Indicators**: Color-coded attendance status (Safe/Warning/Critical)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ktu-attendance-calculator.git
   cd ktu-attendance-calculator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your device**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal or browser
   - Alternatively, run `npm run android` or `npm run ios` for emulator

## 📱 Usage

### Initial Setup

1. **Profile Creation**: Enter your personal details including name, roll number, branch, semester, gender, and PWD status
2. **Subject Selection**: The app automatically loads relevant subjects based on your branch and semester
3. **Attendance Target**: Choose your desired attendance target from the three available options

### Daily Usage

1. **Update Attendance**: Mark your daily attendance for each subject
2. **Monitor Progress**: View real-time attendance percentages and status
3. **Plan Ahead**: See how many classes you can miss or must attend to reach your target

### Subject Management

1. **Edit Mode**: Tap the edit button to modify your subject list
2. **Add Subjects**: Include additional subjects not in the default list
3. **Remove Subjects**: Delete subjects you're not enrolled in
4. **Duplicate Prevention**: App automatically prevents adding duplicate subjects

## 🏗️ Technical Details

### Built With

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **AsyncStorage**: Local data persistence
- **React Hooks**: Modern state management

### Key Dependencies

- `@react-native-async-storage/async-storage`: Local storage
- `@react-native-community/slider`: UI slider component
- `@react-native-picker/picker`: Picker components
- `expo`: Development and build platform

### Project Structure

```
ktu-attendance-calculator/
├── App.js                 # Main application component
├── subjectsData.js        # KTU subjects database
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
├── assets/               # Images and icons
└── README.md            # Project documentation
```

## 🎓 KTU Specific Features

### Comprehensive Subject Database

- All engineering branches supported (CS, EC, ME, CE, EE, etc.)
- Semester-wise subject organization (S1-S8)
- Regular curriculum updates
- Theory and lab subjects included

### Attendance Calculation Logic

- **Condonation Rule**: 60% attendance for exam eligibility with condonation
- **Minimum Attendance**: Dynamic calculation based on student category
- **Custom Targets**: Flexible target setting for personal goals
- **Class Prediction**: Calculate required classes to reach target attendance

### University Compliance

- Follows KTU attendance regulations
- Gender and PWD specific considerations
- Semester-based subject loading
- Branch-specific curriculum support

## 🔧 Customization

### Adding New Subjects

1. Edit `subjectsData.js`
2. Add subjects to the appropriate branch and semester
3. Follow the existing data structure format

### Modifying Attendance Rules

1. Locate attendance calculation functions in `App.js`
2. Update the logic in `evaluateSubject()` and related functions
3. Test thoroughly with different scenarios

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ktu-attendance-calculator/issues) page
2. Create a new issue with detailed description
3. Include your device info, React Native version, and error logs

## 🙏 Acknowledgments

- KTU for providing the curriculum structure
- React Native community for excellent documentation
- Expo team for the development platform
- All contributors who helped improve this app

## 📊 Screenshots

_Add screenshots of your app here to showcase the UI_

---

**Made with ❤️ for KTU students**

_This app is not officially affiliated with APJ Abdul Kalam Technological University_
