import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Switch, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, BackHandler, Modal } from "react-native";
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COURSES, getSemesters, getSubjects } from './subjectsData';

export default function App() {
  // Navigation state: profile setup -> subject management -> results
  const [userProfile, setUserProfile] = useState({
    name: "",
    studentId: "",
    semester: "",
    branch: "",
    college: ""
  });
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [gender, setGender] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [customSubjects, setCustomSubjects] = useState([]);
  const [showCustomSubjectInput, setShowCustomSubjectInput] = useState(false);
  const [customSubjectCode, setCustomSubjectCode] = useState("");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertActions, setAlertActions] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  // Profile-specific dropdowns
  const [showProfileCourseDropdown, setShowProfileCourseDropdown] = useState(false);
  const [showProfileSemesterDropdown, setShowProfileSemesterDropdown] = useState(false);
  const [showTargetAttendanceDropdown, setShowTargetAttendanceDropdown] = useState(false);
  const [customTargetValue, setCustomTargetValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [currentSubject, setCurrentSubject] = useState({
    code: "",
    name: "",
  totalClasses: "",
  attended: "",
    targetAttendance: 75,
    isPwd: false,
  dutyLeaves: "",
  condonationUsed: "",
    isMaternity: false,
  maternityExcused: ""
  });

  // Custom Alert function with theme
  const showAlert = (title, message, actions = [{ text: "OK", onPress: () => setAlertVisible(false) }]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertActions(actions);
    setAlertVisible(true);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowCourseDropdown(false);
    setShowSemesterDropdown(false);
    setShowSubjectDropdown(false);
  setShowProfileCourseDropdown(false);
  setShowProfileSemesterDropdown(false);
    setShowTargetAttendanceDropdown(false);
  };

  // Derive selected course/semester from profile once complete
  useEffect(() => {
    if (isProfileComplete && userProfile.branch && userProfile.semester) {
      const course = userProfile.branch;
      const semester = userProfile.semester;
      setSelectedCourse(course);
      setSelectedSemester(semester);
      const subjects = getSubjects(course, semester);
      setAvailableSubjects([...subjects, ...customSubjects]);
    }
  }, [isProfileComplete, userProfile.branch, userProfile.semester, customSubjects]);

  // Load data on app start
  useEffect(() => {
    loadUserData();
  }, []);

  // Save data whenever important state changes
  useEffect(() => {
    if (isProfileComplete) {
      saveUserData();
    }
  }, [userProfile, gender, subjects, isProfileComplete]);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const genderData = await AsyncStorage.getItem('gender');
      const subjectsData = await AsyncStorage.getItem('subjects');
      const customSubjectsData = await AsyncStorage.getItem('customSubjects');
      
      if (profileData) {
        const p = JSON.parse(profileData);
        // Normalize stored values and validate against dataset
        let normalized = {
          ...p,
          branch: mapBranch(p.branch || ""),
          semester: mapSemester(p.semester || ""),
        };
        if (!COURSES.includes(normalized.branch)) {
          normalized = { ...normalized, branch: "" };
        }
        setUserProfile(normalized);
        if (normalized.branch && normalized.semester && COURSES.includes(normalized.branch)) {
          setSelectedCourse(normalized.branch);
          setSelectedSemester(normalized.semester);
          setIsProfileComplete(true);
        }
      }
      
      if (genderData) {
        try {
          setGender(String(genderData).toLowerCase());
        } catch {
          setGender(genderData);
        }
      }
      
      if (subjectsData) {
        setSubjects(JSON.parse(subjectsData));
      }

      if (customSubjectsData) {
        setCustomSubjects(JSON.parse(customSubjectsData));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('gender', gender);
      await AsyncStorage.setItem('subjects', JSON.stringify(subjects));
      await AsyncStorage.setItem('customSubjects', JSON.stringify(customSubjects));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove(['userProfile', 'gender', 'subjects', 'customSubjects']);
      setUserProfile({
        name: "",
        studentId: "",
        semester: "",
        branch: "",
        college: ""
      });
      setGender("");
  setSubjects([]);
      setCustomSubjects([]);
  setIsProfileComplete(false);
  setShowResults(false);
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  const addCustomSubject = () => {
    if (!customSubjectCode.trim() || !customSubjectName.trim()) {
      showAlert("Error", "Please enter both subject code and name");
      return;
    }

    const newCustomSubject = {
      code: customSubjectCode.trim(),
      name: customSubjectName.trim()
    };

    // Check if custom subject already exists
    if (customSubjects.find(s => s.code === newCustomSubject.code)) {
      showAlert("Error", "Custom subject with this code already exists");
      return;
    }

    const updatedCustomSubjects = [...customSubjects, newCustomSubject];
    setCustomSubjects(updatedCustomSubjects);
    
    // Automatically select the new custom subject
    handleChange("code", newCustomSubject.code);
    handleChange("name", newCustomSubject.name);
    
    // Clear the input fields and hide the form
    setCustomSubjectCode("");
    setCustomSubjectName("");
    setShowCustomSubjectInput(false);
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (!isProfileComplete) {
        // On the profile page, show exit confirmation
        showAlert("Hold on!", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => setAlertVisible(false)
          },
          { 
            text: "EXIT", 
            onPress: () => {
              setAlertVisible(false);
              BackHandler.exitApp();
            }
          }
        ]);
        return true;
      }

      if (showResults) {
        // From results -> go back to subjects
        setShowResults(false);
        return true;
      }

      // On subject management -> go back to profile and reset UI state
      setShowCourseDropdown(false);
      setShowSemesterDropdown(false);
      setShowSubjectDropdown(false);
      setShowCustomSubjectInput(false);
      setCurrentSubject({
        code: "",
        name: "",
  totalClasses: "",
  attended: "",
        targetAttendance: 75,
        isPwd: false,
  dutyLeaves: "",
  condonationUsed: "",
        isMaternity: false,
  maternityExcused: ""
      });
      setCustomTargetValue("");
      setEditingIndex(-1);
      setIsProfileComplete(false);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isProfileComplete, showResults]);

  const numericFields = new Set(["totalClasses","attended","dutyLeaves","condonationUsed","maternityExcused","targetAttendance"]);
  const handleChange = (name, value) => {
    let v = value;
    if (numericFields.has(name)) {
      // strip non-digits except allow empty; remove a single leading zero during typing
      if (typeof v === 'string') {
        v = v.replace(/[^0-9]/g, "");
        if (v === "0") v = ""; // auto-remove single zero
      }
    }
    setCurrentSubject(prev => ({
      ...prev,
      [name]: v
    }));
  };

  const handleSubjectSelect = (subject) => {
    setCurrentSubject({
      ...currentSubject,
      code: subject.code,
      name: subject.name
    });
    setShowSubjectDropdown(false);
  };

  const handleProfileChange = (name, value) => {
    console.log('handleProfileChange called:', name, '=', value);
    setUserProfile(prevProfile => {
      const updated = {
        ...prevProfile,
        [name]: value
      };
      console.log('Updated profile:', updated);
      return updated;
    });
  };

  const completeProfile = () => {
    if (!userProfile.semester.trim() || !userProfile.branch.trim()) {
      showAlert("Error", "Please fill in Semester and Branch");
      return;
    }
    // Normalize and persist
    const normalizedBranch = mapBranch(userProfile.branch);
    const normalizedSemester = mapSemester(userProfile.semester);
    const updated = { ...userProfile, branch: normalizedBranch, semester: normalizedSemester };
    setUserProfile(updated);
    // Initialize subject management selectors from profile
    setSelectedCourse(normalizedBranch);
    setSelectedSemester(normalizedSemester);
    setIsProfileComplete(true);
  };

  const editProfile = () => {
  setIsProfileComplete(false);
  };

  const handleSwitch = (name, value) => {
    setCurrentSubject({
      ...currentSubject,
      [name]: value
    });
  };

  const addSubject = () => {
    if (!currentSubject.code.trim() || !currentSubject.name.trim()) {
      showAlert("Error", "Please select a subject from the dropdown");
      return;
    }
    
    // Check if subject already exists
    const existingIndex = subjects.findIndex(s => s.code === currentSubject.code);
    
    if (existingIndex !== -1 && editingIndex === -1) {
      // Subject exists and we're not editing - ask for overwrite
      showAlert(
        "Duplicate Subject", 
        `Subject "${currentSubject.code}" already exists. Do you want to overwrite it?`,
        [
          {
            text: "Cancel",
            onPress: () => setAlertVisible(false)
          },
          {
            text: "Overwrite",
            onPress: () => {
              // Update existing subject
              const updatedSubjects = [...subjects];
              updatedSubjects[existingIndex] = { ...currentSubject, gender };
              setSubjects(updatedSubjects);
              resetCurrentSubject();
              setAlertVisible(false);
            }
          }
        ]
      );
      return;
    }
    
    if (editingIndex !== -1) {
      // Update existing subject being edited
      const updatedSubjects = [...subjects];
      updatedSubjects[editingIndex] = { ...currentSubject, gender };
      setSubjects(updatedSubjects);
      setEditingIndex(-1);
    } else {
      // Add new subject
      setSubjects([...subjects, { ...currentSubject, gender }]);
    }
    
    resetCurrentSubject();
  };

  const resetCurrentSubject = () => {
    setCurrentSubject({
      code: "",
      name: "",
      totalClasses: "",
      attended: "",
      targetAttendance: 75,
      isPwd: false,
      dutyLeaves: "",
      condonationUsed: "",
      isMaternity: false,
      maternityExcused: ""
    });
    setCustomTargetValue("");
    setEditingIndex(-1);
  };

  const editSubject = (index) => {
    const subject = subjects[index];
    setCurrentSubject(subject);
    setEditingIndex(index);
    // Scroll to top to show the form
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    resetCurrentSubject();
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const goToResults = () => {
    if (subjects.length === 0) {
      showAlert("Error", "Please add at least one subject");
      return;
    }
  setShowResults(true);
  };

  const resetApp = () => {
    showAlert(
      "Reset All Data",
      "This will delete all your profile information and subjects. Are you sure?",
      [
        {
          text: "Cancel",
          onPress: () => setAlertVisible(false)
        },
        {
          text: "Reset",
          onPress: () => {
            clearAllData();
            setAlertVisible(false);
          }
        }
      ]
    );
  };

  const adjustForMaternity = (data) => {
    let total = Number(data.totalClasses);
    if (data.isMaternity) {
      total -= Number(data.maternityExcused);
    }
    return { total };
  };

  const getCurrentAttendance = (attended, totalClasses, dutyLeaves = 0) => {
    const effectiveAttended = Number(attended) + Number(dutyLeaves);
    const effectiveTotal = Number(totalClasses);
    if (effectiveTotal === 0) return 100;
    return (effectiveAttended / effectiveTotal) * 100;
  };

  const getEffectiveMin = (data) => {
    const g = (data.gender || "").toLowerCase();
    let base = g === "male" ? 75 : 73;
    if (data.isPwd) base -= 5;
    return base;
  };

  // Normalize abbreviations to match subjectsData keys
  const mapBranch = (raw) => {
    if (!raw) return raw;
    const s = String(raw).trim();
    const branchMap = {
      CS: 'Computer Science & Engineering',
      CSE: 'Computer Science & Engineering',
      'CSE (DS)': 'CSE (Data Science)',
      CSD: 'CSE (Data Science)',
      DS: 'CSE (Data Science)',
      ME: 'Mechanical Engineering',
      CE: 'Civil Engineering',
      AE: 'Automobile Engineering',
    };
    return branchMap[s] || s;
  };

  const mapSemester = (raw) => {
    if (!raw) return raw;
    const s = String(raw).trim();
    const m = s.match(/^S\s*(\d+)$/i);
    if (m) return `Semester ${m[1]}`;
    return s;
  };

  const getRemainingClasses = (total, attended, dutyLeaves = 0) => {
    return Math.max(0, total - attended - Number(dutyLeaves));
  };

  const classesNeededForTarget = (attended, total, target, dutyLeaves = 0) => {
    const effectiveAttended = Number(attended) + Number(dutyLeaves);
    const requiredTotal = (target / 100) * total;
    let stillNeeded = requiredTotal - effectiveAttended;
    stillNeeded = Math.max(0, stillNeeded);
    return Math.ceil(stillNeeded);
  };

  const evaluateSubject = (subject) => {
    const adjusted = adjustForMaternity(subject);
    const total = adjusted.total;
    const attended = Number(subject.attended);
    const dutyLeaves = Number(subject.dutyLeaves || 0);
    const targetAttendance = Number(subject.targetAttendance || 75);
    
    const currentPercent = getCurrentAttendance(attended, total, dutyLeaves);
    const effectiveMin = getEffectiveMin(subject);
    const remaining = getRemainingClasses(total, attended, dutyLeaves);

    // Check against user's target first
    if (currentPercent >= targetAttendance) {
      const mustAttend = classesNeededForTarget(attended, total, targetAttendance, dutyLeaves);
      const canBunk = Math.max(0, remaining - mustAttend);
      return {
        status: `✅ Target Achieved (${targetAttendance}%)`,
        currentPercent,
        targetAttendance,
        mustAttend,
        canBunk,
        remaining
      };
    }
    // Check against university minimum
    else if (currentPercent >= effectiveMin) {
      const mustAttend = classesNeededForTarget(attended, total, effectiveMin, dutyLeaves);
      const canBunk = Math.max(0, remaining - mustAttend);
      return {
        status: "✅ University Min Met",
        currentPercent,
        effectiveMin,
        mustAttend,
        canBunk,
        remaining
      };
    } 
    // Check condonation eligibility
    else if (currentPercent >= 60 && Number(subject.condonationUsed) < 2) {
      const mustAttend = classesNeededForTarget(attended, total, 60, dutyLeaves);
      const canBunk = Math.max(0, remaining - mustAttend);
      return {
        status: "⚠️ Condonation Needed",
        currentPercent,
        target: 60,
        mustAttend,
        canBunk,
        remaining
      };
    } 
    // Ineligible
    else {
      let reason = [];
      if (currentPercent < 60) reason.push("Below 60%");
      if (Number(subject.condonationUsed) >= 2) reason.push("Max condonation used");
      
      // Calculate classes needed to reach target
      const classesNeededForTarget = Math.max(0, 
        Math.ceil((targetAttendance / 100) * total - attended - dutyLeaves)
      );
      
      return {
        status: "❌ Ineligible",
        currentPercent,
        reason,
        classesNeededForTarget,
        targetAttendance
      };
    }
  };

  const getOverallStats = () => {
    if (subjects.length === 0) return null;
    
    const totalSubjects = subjects.length;
    const eligibleCount = subjects.filter(s => {
      const result = evaluateSubject(s);
      return result.status.includes("Eligible") || result.status.includes("Condonation");
    }).length;
    
    const avgAttendance = subjects.reduce((sum, subject) => {
      const result = evaluateSubject(subject);
      return sum + result.currentPercent;
    }, 0) / totalSubjects;

    return {
      totalSubjects,
      eligibleCount,
      avgAttendance: avgAttendance.toFixed(1)
    };
  };

  // Render Profile Setup
  if (!isProfileComplete) {
    return (
  <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" bounces={false} alwaysBounceVertical={false}>
  <StatusBar style="light" />
        <View style={styles.profileSetupContainer}>
          <Text style={styles.welcomeTitle}>👋 Welcome!</Text>
          <Text style={styles.appTitle}>Let's set up your profile</Text>
          <Text style={styles.subtitle}>Only Semester and Branch are required. Everything stays on your device.</Text>
          
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
              <Text style={styles.privacyText}>
                • All data is stored locally on your device only{"\n"}
                • Nothing is shared with servers or third parties{"\n"}
                • Your information never leaves your phone{"\n"}
                • You can delete all data anytime
              </Text>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={userProfile.name}
                onChangeText={v => handleProfileChange("name", v)}
                placeholder="Enter your full name"
                placeholderTextColor="#8b949e"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student ID</Text>
              <TextInput
                style={styles.input}
                value={userProfile.studentId}
                onChangeText={v => handleProfileChange("studentId", v)}
                placeholder="e.g., KTU123456"
                placeholderTextColor="#8b949e"
              />
            </View>

            {/* Branch first */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Branch *</Text>
              <TouchableOpacity 
                style={styles.inputDropdown} 
                onPress={() => {
                  setShowProfileCourseDropdown(true);
                  setShowProfileSemesterDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>
                  {userProfile.branch || "Select Branch"} {/* Debug: {JSON.stringify(userProfile.branch)} */}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Branch Selection Modal */}
            <Modal
              transparent={true}
              animationType="fade"
              visible={showProfileCourseDropdown}
              onRequestClose={() => setShowProfileCourseDropdown(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowProfileCourseDropdown(false)}
              >
                <TouchableOpacity 
                  style={styles.modalDropdownContainer}
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                  <Text style={styles.modalTitle}>Select Branch</Text>
                  <ScrollView style={styles.modalScrollView} keyboardShouldPersistTaps="handled">
                    {COURSES.map((course) => (
                      <TouchableOpacity
                        key={`course-${course}`}
                        style={styles.modalDropdownItem}
                        onPress={() => {
                          console.log('Selected branch:', course);
                          handleProfileChange("branch", course);
                          handleProfileChange("semester", "");
                          setShowProfileCourseDropdown(false);
                        }}
                      >
                        <Text style={styles.modalDropdownText}>{course}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>

            {/* Then Semester */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Semester *</Text>
              <TouchableOpacity 
                style={styles.inputDropdown}
                onPress={() => {
                  if (!userProfile.branch) {
                    showAlert("Select Branch", "Please select your Branch first");
                    return;
                  }
                  setShowProfileSemesterDropdown(true);
                  setShowProfileCourseDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>
                  {userProfile.semester || "Select Semester"} {/* Debug: {JSON.stringify(userProfile.semester)} */}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Semester Selection Modal */}
            <Modal
              transparent={true}
              animationType="fade"
              visible={showProfileSemesterDropdown}
              onRequestClose={() => setShowProfileSemesterDropdown(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowProfileSemesterDropdown(false)}
              >
                <TouchableOpacity 
                  style={styles.modalDropdownContainer}
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                  <Text style={styles.modalTitle}>Select Semester</Text>
                  <ScrollView style={styles.modalScrollView} keyboardShouldPersistTaps="handled">
                    {(userProfile.branch ? getSemesters(userProfile.branch) : []).map((sem) => (
                      <TouchableOpacity
                        key={`profsem-${sem}`}
                        style={styles.modalDropdownItem}
                        onPress={() => {
                          console.log('Selected semester:', sem);
                          handleProfileChange("semester", sem);
                          setShowProfileSemesterDropdown(false);
                        }}
                      >
                        <Text style={styles.modalDropdownText}>{sem}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <Text style={styles.genderNote}>
                🌟 Fun Fact: Gender benefits are based on biological factors like menstruation cycles, regardless of how you identify! 💪
              </Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === "female" && styles.selectedGender]}
                  onPress={() => setGender("female")}
                >
                  <Text style={[styles.genderText, gender === "female" && styles.selectedGenderText]}>
                    👩 Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.genderButton, gender === "male" && styles.selectedGender]}
                  onPress={() => setGender("male")}
                >
                  <Text style={[styles.genderText, gender === "male" && styles.selectedGenderText]}>
                    👨 Male  
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>College</Text>
              <TextInput
                style={styles.input}
                value={userProfile.college}
                onChangeText={v => handleProfileChange("college", v)}
                placeholder="e.g., CET Trivandrum"
                placeholderTextColor="#8b949e"
              />
            </View>

            <Text style={styles.requiredNote}>* Required: Semester and Branch</Text>

            <View style={styles.privacyReminder}>
              <Text style={styles.privacyReminderText}>
                🔐 Reminder: Your data stays on your device and is never shared anywhere
              </Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={completeProfile}>
              <Text style={styles.addButtonText}>✅ Complete Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Custom Alert Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertTitle}</Text>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <View style={styles.alertButtons}>
                {alertActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alertButton,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonDestructive 
                        : styles.alertButtonDefault
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={[
                      styles.alertButtonText,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonTextDestructive 
                        : styles.alertButtonTextDefault
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  // Gender selection is integrated into profile creation

  // Render Subject Management
  if (isProfileComplete && !showResults) {
    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" bounces={false}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Subjects</Text>
            <Text style={styles.headerSubtitle}>
              {userProfile.name} {userProfile.studentId ? `(${userProfile.studentId})` : ''} | {userProfile.semester} · {userProfile.branch} | Gender: {gender || "-"} | {subjects.length} subjects
            </Text>
          </View>

          <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingIndex !== -1 ? "✏️ Edit Subject" : "📚 Subject Details"}
          </Text>
          {editingIndex !== -1 && (
            <Text style={styles.editingNotice}>
              📝 You are editing: {currentSubject.code} - {currentSubject.name}
            </Text>
          )}
          <Text style={[styles.helpText, {marginBottom: 8}]}>
            {userProfile.semester} · {userProfile.branch}
          </Text>

          {selectedSemester && availableSubjects.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject:</Text>
              <TouchableOpacity 
                style={styles.customDropdown}
                onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {currentSubject.name ? `${currentSubject.code} - ${currentSubject.name}` : "Select Subject"}
                </Text>
                <Text style={styles.dropdownArrow}>{showSubjectDropdown ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              
              {showSubjectDropdown && (
                <View style={[styles.dropdownList, {maxHeight: undefined}]}> 
                  <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
                    {availableSubjects.map((item) => (
                      <TouchableOpacity
                        key={`subject-${item.code}-${item.name}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSubjectSelect(item)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {item.code} - {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Display selected subject */}
          {currentSubject.name && (
            <View style={styles.selectedSubjectContainer}>
              <Text style={styles.selectedSubjectLabel}>✅ Selected Subject:</Text>
              <Text style={styles.selectedSubject}>
                {currentSubject.code} - {currentSubject.name}
              </Text>
            </View>
          )}

          {/* Custom Subject Option */}
          <View style={styles.inputGroup}>
            <TouchableOpacity 
              style={styles.customSubjectButton}
              onPress={() => setShowCustomSubjectInput(!showCustomSubjectInput)}
            >
              <Text style={styles.customSubjectButtonText}>
                {showCustomSubjectInput ? "❌ Cancel Custom Subject" : "➕ Add Custom Subject"}
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomSubjectInput && (
            <View style={styles.customSubjectForm}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Subject Code:</Text>
                  <TextInput
                    style={styles.input}
                    value={customSubjectCode}
                    onChangeText={setCustomSubjectCode}
                    placeholder="e.g., CS401"
                    placeholderTextColor="#8b949e"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 2, marginLeft: 10 }]}>
                  <Text style={styles.label}>Subject Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={customSubjectName}
                    onChangeText={setCustomSubjectName}
                    placeholder="e.g., Advanced Programming"
                    placeholderTextColor="#8b949e"
                  />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.addCustomButton}
                onPress={addCustomSubject}
              >
                <Text style={styles.addCustomButtonText}>✅ Add Custom Subject</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentSubject.name && (
            <View style={styles.inputGroup}>
              <Text style={styles.selectedSubject}>
                Selected: {currentSubject.code} - {currentSubject.name}
              </Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Total Classes:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={currentSubject.totalClasses}
                onChangeText={v => handleChange("totalClasses", v)}
                placeholder=""
                placeholderTextColor="#8b949e"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Attended:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={currentSubject.attended}
                onChangeText={v => handleChange("attended", v)}
                placeholder=""
                placeholderTextColor="#8b949e"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Attendance</Text>
            <TouchableOpacity 
              style={styles.customDropdown}
              onPress={() => setShowTargetAttendanceDropdown(!showTargetAttendanceDropdown)}
            >
              <Text style={styles.dropdownText}>
                {currentSubject.targetAttendance === 60 ? "Condonation (60%)" :
                 currentSubject.targetAttendance === getEffectiveMin({ ...currentSubject, gender }) ? `No Condonation (${getEffectiveMin({ ...currentSubject, gender })}%)` :
                 `Custom (${currentSubject.targetAttendance}%)`}
              </Text>
              <Text style={styles.dropdownArrow}>{showTargetAttendanceDropdown ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            
            {showTargetAttendanceDropdown && (
              <View style={[styles.dropdownList, {maxHeight: undefined}]}> 
                <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
                  {/* Condonation Option */}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("targetAttendance", 60);
                      setShowTargetAttendanceDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Condonation (60%)</Text>
                    <Text style={styles.helpText}>Requires condonation application</Text>
                  </TouchableOpacity>
                  
                  {/* No Condonation Option */}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("targetAttendance", getEffectiveMin({ ...currentSubject, gender }));
                      setShowTargetAttendanceDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>No Condonation ({getEffectiveMin({ ...currentSubject, gender })}%)</Text>
                    <Text style={styles.helpText}>Minimum required without condonation</Text>
                  </TouchableOpacity>
                  
                  {/* Custom Option */}
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>Custom Target (76-100%)</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginTop: 8 }]}
                        keyboardType="numeric"
                        value={customTargetValue}
                        onChangeText={(v) => {
                          // Allow typing numbers, let validation happen on submit
                          const cleanValue = v.replace(/[^0-9]/g, "");
                          setCustomTargetValue(cleanValue);
                        }}
                        placeholder="76-100"
                        placeholderTextColor="#8b949e"
                        maxLength={3}
                      />
                      <TouchableOpacity
                        style={[styles.addButton, { flex: 0, marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8 }]}
                        onPress={() => {
                          const numValue = parseInt(customTargetValue);
                          if (customTargetValue && numValue >= 76 && numValue <= 100) {
                            handleChange("targetAttendance", numValue);
                            setShowTargetAttendanceDropdown(false);
                            setCustomTargetValue("");
                          } else {
                            showAlert("Invalid Value", "Please enter a value between 76 and 100");
                          }
                        }}
                      >
                        <Text style={styles.addButtonText}>Set</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>PWD Relaxation (-5%)</Text>
              <Switch
                value={currentSubject.isPwd}
                onValueChange={v => handleSwitch("isPwd", v)}
                trackColor={{ false: "#30363d", true: "#238636" }}
                thumbColor="#f0f6fc"
              />
            </View>

            {gender === "female" && (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Maternity Leave</Text>
                <Switch
                  value={currentSubject.isMaternity}
                  onValueChange={v => handleSwitch("isMaternity", v)}
                  trackColor={{ false: "#30363d", true: "#238636" }}
                  thumbColor="#f0f6fc"
                />
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duty Leaves (Manual Entry):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={currentSubject.dutyLeaves}
              onChangeText={v => handleChange("dutyLeaves", v)}
              placeholder=""
              placeholderTextColor="#8b949e"
            />
            <Text style={styles.helpText}>
              Enter duty leaves that count as attendance (sports, NCC, etc.)
            </Text>
          </View>

          {currentSubject.isMaternity && (
            <View style={styles.maternityContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Classes Excused (Maternity):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={currentSubject.maternityExcused}
                  onChangeText={v => handleChange("maternityExcused", v)}
                  placeholder=""
                  placeholderTextColor="#8b949e"
                />
                <Text style={styles.helpText}>
                  These classes will be deducted from total classes
                </Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condonation Used (0-2):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={currentSubject.condonationUsed}
              onChangeText={v => handleChange("condonationUsed", v)}
              placeholder=""
              placeholderTextColor="#8b949e"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addSubject}>
            <Text style={styles.addButtonText}>
              {editingIndex !== -1 ? "✅ Update Subject" : "➕ Add Subject"}
            </Text>
          </TouchableOpacity>
          
          {editingIndex !== -1 && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>❌ Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {subjects.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Added Subjects ({subjects.length})</Text>
            {subjects.map((subject, index) => (
              <View key={`added-${subject.code || subject.name}-${index}`} style={[
                styles.subjectItem,
                editingIndex === index && styles.editingSubject
              ]}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>
                    {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                    {editingIndex === index && " (Editing...)"}
                  </Text>
                  <Text style={styles.subjectStats}>
                    {subject.attended}/{subject.totalClasses} 
                    {Number(subject.dutyLeaves) > 0 && ` (+${subject.dutyLeaves} duty)`}
                    {" "}({getCurrentAttendance(Number(subject.attended), Number(subject.totalClasses), Number(subject.dutyLeaves)).toFixed(1)}%)
                    {" "}| Target: {subject.targetAttendance}%
                  </Text>
                </View>
                <View style={styles.subjectActions}>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => editSubject(index)}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeSubject(index)}
                  >
                    <Text style={styles.removeButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              // Back to Profile
              closeAllDropdowns();
              setShowCustomSubjectInput(false);
              setCustomTargetValue("");
              setCurrentSubject({
                code: "",
                name: "",
                totalClasses: "",
                attended: "",
                targetAttendance: 75,
                isPwd: false,
                dutyLeaves: "",
                condonationUsed: "",
                isMaternity: false,
                maternityExcused: ""
              });
              setIsProfileComplete(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.primaryButton, subjects.length === 0 && styles.disabledButton]} 
            onPress={goToResults}
            disabled={subjects.length === 0}
          >
            <Text style={styles.primaryButtonText}>View Results →</Text>
          </TouchableOpacity>
        </View>
        
        {/* Custom Alert Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertTitle}</Text>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <View style={styles.alertButtons}>
                {alertActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alertButton,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonDestructive 
                        : styles.alertButtonDefault
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={[
                      styles.alertButtonText,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonTextDestructive 
                        : styles.alertButtonTextDefault
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
  </Modal>
  </ScrollView>
    );
  }

  // Render Results
  if (showResults) {
    const overallStats = getOverallStats();
    
    return (
      <ScrollView contentContainerStyle={styles.container}>
  <StatusBar style="light" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Attendance Results</Text>
          <Text style={styles.headerSubtitle}>
            {userProfile.name} | {userProfile.semester} {userProfile.branch} | Gender: {gender}
          </Text>
        </View>

        {overallStats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📈 Overall Summary</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{overallStats.totalSubjects}</Text>
                <Text style={styles.statLabel}>Total Subjects</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{overallStats.eligibleCount}</Text>
                <Text style={styles.statLabel}>Eligible</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{overallStats.avgAttendance}%</Text>
                <Text style={styles.statLabel}>Avg Attendance</Text>
              </View>
            </View>
          </View>
        )}

        {subjects.map((subject, index) => {
          const result = evaluateSubject(subject);
          const isEligible = result.status.includes("Eligible");
          const isCondonation = result.status.includes("Condonation");
          
          return (
            <View key={index} style={[
              styles.resultCard,
              isEligible ? styles.eligibleCard : isCondonation ? styles.condonationCard : styles.ineligibleCard
            ]}>
              <Text style={styles.subjectNameResult}>
                {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
              </Text>
              <Text style={[
                styles.statusText,
                isEligible ? styles.eligibleText : isCondonation ? styles.condonationText : styles.ineligibleText
              ]}>
                {result.status}
              </Text>
              
              <View style={styles.resultStats}>
                <Text style={styles.resultText}>
                  Current: {result.currentPercent.toFixed(1)}%
                </Text>
                <Text style={styles.resultText}>
                  Target: {subject.targetAttendance}%
                </Text>
                
                {(result.status.includes("Target Achieved") || result.status.includes("University Min") || result.status.includes("Condonation")) && (
                  <>
                    <Text style={styles.resultText}>
                      Must attend: {result.mustAttend} more classes
                    </Text>
                    <Text style={styles.resultText}>
                      Can bunk: {result.canBunk} classes
                    </Text>
                    <Text style={styles.resultText}>
                      Remaining: {result.remaining} classes
                    </Text>
                    {Number(subject.dutyLeaves) > 0 && (
                      <Text style={styles.resultText}>
                        Duty leaves: {subject.dutyLeaves}
                      </Text>
                    )}
                  </>
                )}
                
                {result.status.includes("Ineligible") && (
                  <>
                    <Text style={styles.resultText}>
                      Reason: {result.reason.join(", ")}
                    </Text>
                    {result.classesNeededForTarget > 0 && (
                      <Text style={styles.resultText}>
                        Need {result.classesNeededForTarget} more classes for {result.targetAttendance}% target
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowResults(false)}>
            <Text style={styles.secondaryButtonText}>← Back to Subjects</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerButton} onPress={resetApp}>
            <Text style={styles.dangerButtonText}>🔄 Start Over</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerPrivacy}>
          <Text style={styles.footerPrivacyText}>
            🔒 All your data is stored locally and privately on your device
          </Text>
        </View>
        
        {/* Custom Alert Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertTitle}</Text>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
              <View style={styles.alertButtons}>
                {alertActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alertButton,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonDestructive 
                        : styles.alertButtonDefault
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={[
                      styles.alertButtonText,
                      index === alertActions.length - 1 && alertActions.length > 1 
                        ? styles.alertButtonTextDestructive 
                        : styles.alertButtonTextDefault
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
  
  // Fallback render - should not happen, but prevents crashes
  return (
    <View style={styles.container}>
  <StatusBar style="light" />
      <Text style={styles.welcomeTitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0d1117",
    padding: 20,
    paddingTop: 50,
  },
  profileSetupContainer: {
    flex: 1,
    justifyContent: "center",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f0f6fc",
  },
  editProfileButton: {
    backgroundColor: "#21262d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  editProfileText: {
    color: "#8b949e",
    fontSize: 12,
  },
  requiredNote: {
    fontSize: 12,
    color: "#8b949e",
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  privacyNotice: {
    backgroundColor: "#0f2419",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#238636",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#238636",
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: "#7dd3fc",
    lineHeight: 18,
  },
  privacyReminder: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#238636",
  },
  privacyReminderText: {
    fontSize: 12,
    color: "#7dd3fc",
    textAlign: "center",
  },
  footerPrivacy: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  footerPrivacyText: {
    fontSize: 11,
    color: "#8b949e",
    textAlign: "center",
    fontStyle: "italic",
  },
  genderSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    color: "#8b949e",
    textAlign: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0f6fc",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8b949e",
    textAlign: "center",
    marginBottom: 40,
  },
  genderButton: {
    width: "100%",
    maxWidth: 280,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  maleButton: {
    backgroundColor: "#0969da",
    borderColor: "#1f6feb",
  },
  femaleButton: {
    backgroundColor: "#8250df",
    borderColor: "#a475f9",
  },
  genderButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 4,
  },
  genderRequirement: {
    fontSize: 14,
    color: "#f0f6fc",
    opacity: 0.8,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f0f6fc",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8b949e",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 16,
  },
  editingNotice: {
    fontSize: 14,
    color: "#d29922",
    backgroundColor: "#2d2102",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f0f6fc",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#0d1117",
    color: "#f0f6fc",
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderCheckpointsContainer: {
    marginTop: 4,
    position: "relative",
    height: 36,
  },
  sliderCheckpointRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sliderCheckpoint: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#238636',
    borderRadius: 1,
    zIndex: 2,
  },
  sliderLabelsRow: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  sliderLabel: {
    color: "#8b949e",
    fontSize: 10,
    textAlign: "center",
    width: 48,
    position: 'absolute',
    marginLeft: -24,
  },
  helpText: {
    fontSize: 12,
    color: "#8b949e",
    fontStyle: "italic",
    marginTop: 4,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  switchLabel: {
    fontSize: 14,
    color: "#f0f6fc",
  },
  maternityContainer: {
    backgroundColor: "#0d1117",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  addButton: {
    backgroundColor: "#238636",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#da3633",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "600",
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  editingSubject: {
    backgroundColor: "#2d2102",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderColor: "#d29922",
    borderWidth: 1,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f0f6fc",
  },
  subjectStats: {
    fontSize: 14,
    color: "#8b949e",
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  editButtonText: {
    fontSize: 18,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: "#238636",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#21262d",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#30363d",
    flex: 1,
    marginRight: 8,
  },
  dangerButton: {
    backgroundColor: "#da3633",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#484f58",
  },
  primaryButtonText: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  dangerButtonText: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#238636",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#238636",
  },
  statLabel: {
    fontSize: 12,
    color: "#8b949e",
    marginTop: 4,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  eligibleCard: {
    backgroundColor: "#0f2419",
    borderColor: "#238636",
  },
  condonationCard: {
    backgroundColor: "#2d2102",
    borderColor: "#d29922",
  },
  ineligibleCard: {
    backgroundColor: "#2d0e0e",
    borderColor: "#da3633",
  },
  subjectNameResult: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  eligibleText: {
    color: "#238636",
  },
  condonationText: {
    color: "#d29922",
  },
  ineligibleText: {
    color: "#da3633",
  },
  resultStats: {
    gap: 4,
  },
  resultText: {
    fontSize: 14,
    color: "#8b949e",
    marginBottom: 2,
  },
  selectedSubject: {
    fontSize: 14,
    color: "#238636",
    fontWeight: "600",
    padding: 12,
    backgroundColor: "#0f2419",
    borderRadius: 8,
    borderColor: "#238636",
    borderWidth: 1,
    textAlign: "center",
  },
  customSubjectButton: {
    backgroundColor: "#21262d",
    borderColor: "#238636",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  customSubjectButtonText: {
    color: "#238636",
    fontSize: 14,
    fontWeight: "600",
  },
  customSubjectForm: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  addCustomButton: {
    backgroundColor: "#238636",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  addCustomButtonText: {
    color: "#f0f6fc",
    fontSize: 14,
    fontWeight: "600",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#21262d",
    borderRadius: 12,
    padding: 24,
    minWidth: 280,
    maxWidth: 340,
    borderColor: "#30363d",
    borderWidth: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 12,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    color: "#8b949e",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  alertButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  alertButtonDefault: {
    backgroundColor: "#238636",
  },
  alertButtonDestructive: {
    backgroundColor: "#da3633",
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  alertButtonTextDefault: {
    color: "#f0f6fc",
  },
  alertButtonTextDestructive: {
    color: "#f0f6fc",
  },
  customDropdown: {
    backgroundColor: "#21262d",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "#f0f6fc",
    fontSize: 16,
  },
  dropdownArrow: {
    color: "#8b949e",
    fontSize: 14,
    marginLeft: 8,
  },
  inputDropdown: {
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#0d1117",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownList: {
    backgroundColor: "#21262d",
    borderColor: "#30363d",
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 2000,
    elevation: 4,
  },
  dropdownScrollView: {
    maxHeight: 180,
  },
  dropdownItem: {
    padding: 16,
    borderBottomColor: "#30363d",
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    color: "#f0f6fc",
    fontSize: 16,
  },
  selectedSubjectContainer: {
    backgroundColor: "#0f2419",
    borderColor: "#238636",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  selectedSubjectLabel: {
    color: "#238636",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedSubject: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "500",
  },
  genderNote: {
    color: "#8b949e",
    fontSize: 12,
    marginBottom: 8,
    fontStyle: "italic",
    lineHeight: 16,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#21262d",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  selectedGender: {
    backgroundColor: "#0f2419",
    borderColor: "#238636",
    borderWidth: 2,
  },
  genderText: {
    color: "#8b949e",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedGenderText: {
    color: "#238636",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalDropdownContainer: {
    backgroundColor: "#21262d",
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: 400,
    maxHeight: 400,
    borderColor: "#30363d",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalDropdownItem: {
    padding: 16,
    borderBottomColor: "#30363d",
    borderBottomWidth: 1,
    borderRadius: 4,
  },
  modalDropdownText: {
    color: "#f0f6fc",
    fontSize: 16,
  },
});
