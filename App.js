import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, BackHandler, Modal, Image, Platform, Linking, Slider } from "react-native";
import { 
  TextInput, 
  Button, 
  Switch, 
  Card, 
  IconButton, 
  Text, 
  Surface,
  Appbar,
  Menu,
  Divider,
  Chip,
  FAB,
  Icon
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COURSES, getSemesters, getSubjects } from './subjectsData';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';

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
  const [importedData, setImportedData] = useState([]);
  const [currentImportIndex, setCurrentImportIndex] = useState(0);
  const [isFinalAttendance, setIsFinalAttendance] = useState(false);
  
  // Debug: Monitor subjects state changes
  useEffect(() => {
    console.log('Subjects state changed:', subjects.length, subjects.map(s => s.code));
  }, [subjects]);
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
  const [proteinShakeModalVisible, setProteinShakeModalVisible] = useState(false);
  const [proteinShakeAmount, setProteinShakeAmount] = useState(50);

  // Protein shake descriptions
  const proteinShakeDescriptions = {
    5: "One spoon of protein powder",
    25: "Half cup of protein shake",
    50: "One full cup of protein shake",
    75: "Tall glass of protein shake",
    100: "One blender's worth of protein shake",
    1000: "A swimming pool filled with protein shake"
  };
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
              AsyncStorage.setItem('subjects', JSON.stringify(updatedSubjects));
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
      AsyncStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      setEditingIndex(-1);
    } else {
      // Add new subject
      const newSubjects = [...subjects, { ...currentSubject, gender }];
      setSubjects(newSubjects);
      AsyncStorage.setItem('subjects', JSON.stringify(newSubjects));
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
    AsyncStorage.setItem('subjects', JSON.stringify(newSubjects));
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
    // If someone has 100% attendance (attended equals total), they likely entered
    // total as "classes held so far" not "total expected for semester"
    // In this case, we should assume more classes are coming
    const attendedNum = Number(attended);
    const totalNum = Number(total);
    
    if (attendedNum === totalNum && attendedNum > 0) {
      // User has 100% attendance - assume more classes will happen
      // Use a reasonable buffer (25% more classes expected)
      const estimatedFutureClasses = Math.ceil(totalNum * 0.25);
      return estimatedFutureClasses;
    }
    
    // Normal case: remaining classes = total planned - attended
    return Math.max(0, totalNum - attendedNum);
  };

  const classesNeededForTarget = (attended, total, target, dutyLeaves = 0) => {
    const effectiveAttended = Number(attended) + Number(dutyLeaves);
    const requiredTotal = (target / 100) * total;
    let stillNeeded = requiredTotal - effectiveAttended;
    stillNeeded = Math.max(0, stillNeeded);
    return Math.ceil(stillNeeded);
  };

  const evaluateSubject = (subject, isFinal = false) => {
    const adjusted = adjustForMaternity(subject);
    const total = adjusted.total;
    const attended = Number(subject.attended);
    const dutyLeaves = Number(subject.dutyLeaves || 0);
    const targetAttendance = Number(subject.targetAttendance || 75);
    
    const currentPercent = getCurrentAttendance(attended, total, dutyLeaves);
    const effectiveMin = getEffectiveMin(subject);
    const remaining = getRemainingClasses(total, attended, dutyLeaves);

    // If this is final attendance, show different messaging
    if (isFinal) {
      if (currentPercent >= targetAttendance) {
        return {
          status: `Final: Target Achieved (${targetAttendance}%)`,
          currentPercent,
          targetAttendance,
          isFinal: true
        };
      } else if (currentPercent >= effectiveMin) {
        return {
          status: `Final: University Min Met (${effectiveMin}%)`,
          currentPercent,
          effectiveMin,
          isFinal: true
        };
      } else if (currentPercent >= 60 && Number(subject.condonationUsed) < 2) {
        return {
          status: "Final: Condonation Needed (60%)",
          currentPercent,
          target: 60,
          isFinal: true
        };
      } else {
        let reason = [];
        if (currentPercent < 60) reason.push("Below 60% minimum");
        if (Number(subject.condonationUsed) >= 2) reason.push("Condonation limit exceeded");
        return {
          status: "Final: Ineligible",
          currentPercent,
          reason: reason.join(", "),
          isFinal: true
        };
      }
    }

    // Original logic for ongoing semester (not final)
    // Check against user's target first
    if (currentPercent >= targetAttendance) {
      const mustAttend = classesNeededForTarget(attended, total, targetAttendance, dutyLeaves);
      const canBunk = Math.max(0, remaining - mustAttend);
      
      return {
        status: `Target Achieved (${targetAttendance}%)`,
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
        status: "University Min Met",
        currentPercent,
        effectiveMin,
        mustAttend,
        canBunk,
        remaining
      };
    } 
    // Check condonation eligibility
    else if (currentPercent >= 60 && Number(subject.condonationUsed) < 2) {
      // For condonation cases, show what's needed to reach target (not just 60%)
      const mustAttendForTarget = classesNeededForTarget(attended, total, targetAttendance, dutyLeaves);
      const mustAttendFor60 = classesNeededForTarget(attended, total, 60, dutyLeaves);
      
      console.log('Condonation case:', { 
        attended, total, dutyLeaves, currentPercent, targetAttendance,
        mustAttendForTarget, mustAttendFor60, remaining 
      });
      
      return {
        status: "Condonation Needed",
        currentPercent,
        target: 60, // Minimum needed
        targetAttendance, // Ideal target
        mustAttend: mustAttendForTarget, // Classes needed to reach ideal target
        mustAttendFor60, // Classes needed to maintain 60%
        canBunk: Math.max(0, remaining - mustAttendForTarget), // Very limited bunking
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
        status: "Ineligible",
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
      const result = evaluateSubject(s, isFinalAttendance);
      return result.currentPercent >= 75; // Only count subjects with 75%+ attendance as eligible
    }).length;
    
    const avgAttendance = subjects.reduce((sum, subject) => {
      const result = evaluateSubject(subject, isFinalAttendance);
      return sum + result.currentPercent;
    }, 0) / totalSubjects;

    return {
      totalSubjects,
      eligibleCount,
      avgAttendance: avgAttendance.toFixed(1)
    };
  };

  // Excel/CSV Import Function with robust file reading & flexible header mapping
  const importFromExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      console.log('Selected file:', file.name, file.mimeType, file.size);
      
      showAlert("Processing", "Reading and processing your file...");

      let data = [];
      // Helper: normalize header keys
      const normalizeKey = (k) => String(k || '')
        .toLowerCase()
        .replace(/[^a-z0-9%]/g, '') // drop spaces & punctuation
        .trim();
      // Helper: robust CSV parsing supporting quoted commas
      const parseCSV = (text) => {
        const rows = [];
        let i = 0, field = '', row = [], inQuotes = false;
        const pushField = () => { row.push(field); field = ''; };
        const pushRow = () => { rows.push(row); row = []; };
        while (i < text.length) {
          const ch = text[i];
          if (inQuotes) {
            if (ch === '"') {
              if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
              inQuotes = false; i++; continue;
            }
            field += ch; i++; continue;
          }
          if (ch === '"') { inQuotes = true; i++; continue; }
          if (ch === ',') { pushField(); i++; continue; }
          if (ch === '\n') { pushField(); pushRow(); i++; continue; }
          if (ch === '\r') { // handle CRLF
            if (text[i + 1] === '\n') { i += 2; } else { i++; }
            pushField(); pushRow();
            continue;
          }
          field += ch; i++;
        }
        // last field/row
        pushField(); if (row.length > 1 || (row.length === 1 && row[0] !== '')) pushRow();
        return rows;
      };
      // Helper: map row by headers
      const toObjects = (rows, headerRowIndex) => {
        const headers = rows[headerRowIndex].map(h => (h || '').replace(/"/g, '').trim());
        const out = [];
        for (let r = headerRowIndex + 1; r < rows.length; r++) {
          const line = rows[r];
          if (!line || line.every(c => String(c || '').trim() === '')) continue;
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = (line[idx] ?? '').toString().trim(); });
          out.push(obj);
        }
        return out;
      };
      
      try {
        if (file.name.toLowerCase().endsWith('.csv') || (file.mimeType && file.mimeType.includes('csv'))) {
          // For CSV files, try to read as text
          console.log('Processing CSV file');
          let text;
          try {
            // First try with FileSystem (works on iOS and some Android cases)
            text = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
          } catch (fsError) {
            // If FileSystem fails, try fetch for content:// URIs on Android
            console.log('FileSystem failed, trying fetch:', fsError.message);
            const response = await fetch(file.uri);
            text = await response.text();
          }
          console.log('CSV content length:', text.length);
          const rows = parseCSV(text);
          console.log('CSV parsed rows:', rows.length);
          // Detect header row: look for 'Sl.No.' or 'Course Name' or any cell containing 'course'
          let headerRowIndex = rows.findIndex(r => 
            r.some(c => /sl\.?no\.?/i.test(c) || /course.*name/i.test(c) || /^course$/i.test(c))
          );
          if (headerRowIndex === -1 && rows.length > 0) headerRowIndex = 0; // fallback to first row
          const objects = toObjects(rows, headerRowIndex);
          data = objects;
        } else {
          // For Excel files, read as base64
          console.log('Processing Excel file');
          let b64;
          try {
            b64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
          } catch (fsError) {
            // If FileSystem fails, try fetch and convert to base64
            console.log('FileSystem failed, trying fetch for Excel:', fsError.message);
            const response = await fetch(file.uri);
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            b64 = btoa(String.fromCharCode.apply(null, uint8Array));
          }
          const workbook = XLSX.read(b64, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
          // Find header row: includes 'Sl.No.' or 'Course Name' (case-insensitive)
          let headerRowIndex = -1;
          for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row && row.some(cell => 
              /sl\.?no\.?/i.test(String(cell)) || 
              /course.*name/i.test(String(cell)) || 
              /^course$/i.test(String(cell))
            )) { 
              headerRowIndex = i; 
              break; 
            }
          }
          if (headerRowIndex === -1) headerRowIndex = 0;
          // Convert to objects
          const rows = rawData;
          const headers = rows[headerRowIndex].map(h => String(h || '').trim());
          const objects = [];
          for (let r = headerRowIndex + 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0 || row.every(c => String(c || '').trim() === '')) continue;
            const obj = {};
            headers.forEach((h, idx) => { obj[h] = String(row[idx] ?? '').trim(); });
            objects.push(obj);
          }
          data = objects;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setAlertVisible(false);
        showAlert("Parse Error", `Failed to read file content: ${parseError.message}`);
        return;
      }

      console.log('Parsed data rows:', data.length);

      if (data.length === 0) {
        setAlertVisible(false);
        showAlert("Error", "No valid course data found in the file. Please check that your file contains course attendance data.");
        return;
      }

      // Process the imported data with flexible header mapping (SCMS/Linways variants)
      const importedSubjects = [];
      
      // Debug: log first row to see actual headers
      if (data.length > 0) {
        console.log('First row headers:', Object.keys(data[0]));
        console.log('First row data:', data[0]);
      }
      
      data.forEach((row, index) => {
        console.log(`Processing row ${index}:`, row);
        
        // Skip rows that are totals or empty
        const firstCol = Object.values(row)[0];
        if (!firstCol || /total/i.test(String(firstCol)) || String(firstCol).trim() === '') {
          console.log(`Skipping row ${index}: appears to be total or empty`);
          return;
        }
        
        const keyMap = Object.keys(row).reduce((acc, k) => { acc[normalizeKey(k)] = k; return acc; }, {});
        console.log('Normalized keyMap:', keyMap);
        // Find course name column - try multiple variations including exact SCMS format
        const courseKey = keyMap['coursename'] || keyMap['course'] || keyMap['subjectname'] || keyMap['subject'] || 
                         keyMap['coursenamecode'] || keyMap['name'] || keyMap['coursecode'] ||
                         Object.keys(row).find(k => /course.*name|subject.*name|^course$|^name$/i.test(k)) ||
                         Object.keys(row)[1]; // SCMS format has Course Name as second column after Sl.No.
        console.log('Using courseKey:', courseKey);
        const courseName = String(row[courseKey] || '').trim();
        if (!courseName) return;
        
        const codeMatch = courseName.match(/\(\s*([^)]+)\s*\)/);
        const subjectCode = codeMatch ? codeMatch[1].trim() : `IMP${index + 1}`;
        
        // Clean subject name (remove code in parentheses)
        const subjectName = courseName.replace(/\s*\([^)]+\)\s*/, '').trim() || `Imported Subject ${index + 1}`;
        
        // Map totals/attended/duty leaves with SCMS-specific column names
        const totalKey = keyMap['th'] || keyMap['totalhours'] || keyMap['totalclasses'] || keyMap['total'] || 
                        keyMap['periods'] || keyMap['totalperiods'] ||
                        Object.keys(row).find(k => /^th$|total.*hours?|total.*classes?|total.*periods?/i.test(k));
        const attendedKey = keyMap['ah'] || keyMap['attendedhours'] || keyMap['attended'] || keyMap['present'] ||
                           keyMap['attendedclasses'] || keyMap['attendedperiods'] ||
                           Object.keys(row).find(k => /^ah$|attended.*hours?|attended.*classes?|present/i.test(k));
        const dutyKey = keyMap['dl'] || keyMap['dutyleaves'] || keyMap['duty'] || keyMap['onduty'] || keyMap['od'] ||
                       Object.keys(row).find(k => /^dl$|duty.*leaves?|on.*duty|^od$/i.test(k));
        
        console.log('Column mapping:', {totalKey, attendedKey, dutyKey});
        const totalClasses = String(totalKey ? row[totalKey] : '0').replace(/[^0-9]/g, '') || '0';
        const attended = String(attendedKey ? row[attendedKey] : '0').replace(/[^0-9]/g, '') || '0';
        const dutyLeaves = String(dutyKey ? row[dutyKey] : '0').replace(/[^0-9]/g, '') || '0';
        
        // Set default target attendance to 75% (user can modify later if needed)
        const targetAttendance = 75;

        const subject = {
          code: subjectCode,
          name: subjectName,
          totalClasses: totalClasses,
          attended: attended,
          targetAttendance: targetAttendance,
          isPwd: false,
          dutyLeaves: dutyLeaves,
          condonationUsed: "0",
          isMaternity: false,
          maternityExcused: "0",
          gender: gender
        };

        console.log('Created subject:', subject);
        console.log('Current gender value:', gender);
        importedSubjects.push(subject);
      });

      console.log('Total subjects created:', importedSubjects.length);

      if (importedSubjects.length === 0) {
        setAlertVisible(false);
        showAlert("Error", "No valid subjects could be extracted from the file. Please check the file format.");
        return;
      }

      console.log('About to auto-fill form with', importedSubjects.length, 'subjects');

      // Auto-fill the form with first imported subject
      setImportedData(importedSubjects);
      setCurrentImportIndex(0);
      
      if (importedSubjects.length > 0) {
        const firstSubject = importedSubjects[0];
        setCurrentSubject({
          code: firstSubject.code,
          name: firstSubject.name,
          totalClasses: firstSubject.totalClasses,
          attended: firstSubject.attended,
          targetAttendance: firstSubject.targetAttendance,
          isPwd: firstSubject.isPwd,
          dutyLeaves: firstSubject.dutyLeaves,
          condonationUsed: firstSubject.condonationUsed,
          isMaternity: firstSubject.isMaternity,
          maternityExcused: firstSubject.maternityExcused
        });
        
        showAlert("Import Success", 
          `Found ${importedSubjects.length} subjects! The first subject has been loaded into the form. Review and click "Add Subject" to save it, then use the navigation buttons to go through the remaining subjects.`
        );
      }
      
      setAlertVisible(false); // Close the processing alert

    } catch (error) {
      console.error('Import error:', error);
      setAlertVisible(false);
      showAlert("Import Error", `Failed to import file: ${error.message}`);
    }
  };

  const loadNextImportedSubject = () => {
    if (currentImportIndex < importedData.length - 1) {
      const nextIndex = currentImportIndex + 1;
      const nextSubject = importedData[nextIndex];
      setCurrentImportIndex(nextIndex);
      setCurrentSubject({
        code: nextSubject.code,
        name: nextSubject.name,
        totalClasses: nextSubject.totalClasses,
        attended: nextSubject.attended,
        targetAttendance: nextSubject.targetAttendance,
        isPwd: nextSubject.isPwd,
        dutyLeaves: nextSubject.dutyLeaves,
        condonationUsed: nextSubject.condonationUsed,
        isMaternity: nextSubject.isMaternity,
        maternityExcused: nextSubject.maternityExcused
      });
    }
  };

  const loadPreviousImportedSubject = () => {
    if (currentImportIndex > 0) {
      const prevIndex = currentImportIndex - 1;
      const prevSubject = importedData[prevIndex];
      setCurrentImportIndex(prevIndex);
      setCurrentSubject({
        code: prevSubject.code,
        name: prevSubject.name,
        totalClasses: prevSubject.totalClasses,
        attended: prevSubject.attended,
        targetAttendance: prevSubject.targetAttendance,
        isPwd: prevSubject.isPwd,
        dutyLeaves: prevSubject.dutyLeaves,
        condonationUsed: prevSubject.condonationUsed,
        isMaternity: prevSubject.isMaternity,
        maternityExcused: prevSubject.maternityExcused
      });
    }
  };

  const clearImportedData = () => {
    setImportedData([]);
    setCurrentImportIndex(0);
    resetCurrentSubject();
  };

  // Render Profile Setup
  if (!isProfileComplete) {
    return (
      <Surface style={styles.container}>
        <StatusBar style="light" hidden={true} />
        <ScrollView 
          contentContainerStyle={styles.profileSetupContainer} 
          keyboardShouldPersistTaps="handled" 
          bounces={false} 
          alwaysBounceVertical={false}
        >
          <Surface style={styles.welcomeHeader} elevation={0}>
            <Text variant="headlineLarge" style={styles.appTitle}>
              KTU Attendance Tracker
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Let's set up your profile to get started
            </Text>
          </Surface>
          
          <Card style={styles.privacyCard} mode="contained">
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Surface style={styles.privacyIcon} elevation={1}>
                  <Icon source="lock" size={20} color="#E8EAED" />
                </Surface>
                <View style={styles.privacyTextContainer}>
                  <Text variant="titleMedium" style={styles.privacyTitle}>
                    Your Privacy is Protected
                  </Text>
                  <Text variant="bodySmall" style={styles.privacyText}>
                    • All data stays on your device only{"\n"}
                    • Nothing is shared or uploaded{"\n"}
                    • Complete control over your information
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.profileCard} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Personal Information
              </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                mode="outlined"
                value={userProfile.name}
                onChangeText={v => handleProfileChange("name", v)}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student ID</Text>
              <TextInput
                mode="outlined"
                value={userProfile.studentId}
                onChangeText={v => handleProfileChange("studentId", v)}
                placeholder="e.g., KTU123456"
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
                Fun Fact: Gender benefits are based on biological factors like menstruation cycles, regardless of how you identify!
              </Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === "female" && styles.selectedGender]}
                  onPress={() => setGender("female")}
                >
                  <Text style={[styles.genderText, gender === "female" && styles.selectedGenderText]}>
                    Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.genderButton, gender === "male" && styles.selectedGender]}
                  onPress={() => setGender("male")}
                >
                  <Text style={[styles.genderText, gender === "male" && styles.selectedGenderText]}>
                    Male
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>College</Text>
              <TextInput
                mode="outlined"
                value={userProfile.college}
                onChangeText={v => handleProfileChange("college", v)}
                placeholder="e.g., CET Trivandrum"
              />
            </View>

            <Text variant="bodySmall" style={styles.requiredNote}>
              * Required: Semester and Branch
            </Text>

            <Surface style={styles.privacyReminder} elevation={0}>
              <Text variant="bodySmall" style={styles.privacyReminderText}>
                Reminder: Your data stays on your device and is never shared anywhere
              </Text>
            </Surface>

            <Button mode="contained" icon="check-circle" onPress={completeProfile} style={{ marginTop: 8 }}>
              Complete Profile
            </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
    );
  }

  // Gender selection is integrated into profile creation

  // Render Subject Management
  if (isProfileComplete && !showResults) {
    return (
      <Surface style={styles.container}>
        <StatusBar style="light" hidden={true} />
        <Appbar.Header>
          <Appbar.Content 
            title="Add Subjects" 
            subtitle={`${userProfile.name} | ${userProfile.semester} · ${userProfile.branch} | ${subjects.length} subjects`}
          />
          <Appbar.Action 
            icon="account-edit" 
            onPress={() => setIsProfileComplete(false)} 
          />
        </Appbar.Header>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled" 
          bounces={false}
        >
          <Card style={styles.subjectCard} mode="elevated">
            <Card.Content>
              {/* Import Section */}
              <View style={styles.importOptionsContainer}>
                <Button 
                  mode="contained" 
                  icon="file-excel" 
                  onPress={importFromExcel}
                  style={styles.importButton}
                  contentStyle={styles.optionButtonContent}
                >
                  Import Attendance Report
                </Button>
                
                <Text variant="bodySmall" style={styles.importHelpText}>
                  Use Linways export functionality to download your attendance report, then import the CSV/Excel file here to auto-fill all subjects
                </Text>
                
                <View style={styles.finalAttendanceContainer}>
                  <Switch
                    value={isFinalAttendance}
                    onValueChange={setIsFinalAttendance}
                    thumbColor={isFinalAttendance ? '#238636' : '#f4f3f4'}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                  />
                  <Text style={styles.finalAttendanceLabel}>
                    This is my final semester attendance (no more classes)
                  </Text>
                </View>
              </View>
              
          {editingIndex !== -1 && (
            <Text style={styles.editingNotice}>
              You are editing: {currentSubject.code} - {currentSubject.name}
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
              <Text style={styles.selectedSubjectLabel}>Selected Subject:</Text>
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
                {showCustomSubjectInput ? "Cancel Custom Subject" : "Add Custom Subject"}
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomSubjectInput && (
            <View style={styles.customSubjectForm}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Subject Code:</Text>
                  <TextInput
                    style={styles.input}
                    value={customSubjectCode}
                    onChangeText={setCustomSubjectCode}
                    placeholder="e.g., CS401"
                    placeholderTextColor="#8b949e"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 2, marginLeft: 8 }]}>
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
                <Text style={styles.addCustomButtonText}>Add Custom Subject</Text>
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

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
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
              <Switch value={currentSubject.isPwd} onValueChange={v => handleSwitch("isPwd", v)} />
            </View>

            {gender === "female" && (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Maternity Leave</Text>
                <Switch value={currentSubject.isMaternity} onValueChange={v => handleSwitch("isMaternity", v)} />
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

          <Button mode="contained" onPress={addSubject}>
            {editingIndex !== -1 ? 'Update Subject' : 'Add Subject'}
          </Button>
          
          {/* Import Navigation */}
          {importedData.length > 0 && (
            <View style={styles.importNavigationContainer}>
              <Text style={styles.importNavigationText}>
                Imported Subject {currentImportIndex + 1} of {importedData.length}
              </Text>
              <View style={styles.importNavigationButtons}>
                <Button 
                  mode="outlined" 
                  onPress={loadPreviousImportedSubject}
                  disabled={currentImportIndex === 0}
                  style={styles.navigationButton}
                >
                  ← Previous
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={loadNextImportedSubject}
                  disabled={currentImportIndex === importedData.length - 1}
                  style={styles.navigationButton}
                >
                  Next →
                </Button>
                <Button 
                  mode="text" 
                  onPress={clearImportedData}
                  style={styles.navigationButton}
                  textColor="#f85149"
                >
                  Clear Import
                </Button>
              </View>
            </View>
          )}
          
          {editingIndex !== -1 && (
            <Button mode="outlined" onPress={cancelEdit} style={{ marginTop: 8 }}>
              Cancel Edit
            </Button>
          )}
            </Card.Content>
          </Card>

        {subjects.length > 0 && (
          <Card style={styles.subjectsListCard} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Added Subjects ({subjects.length})
              </Text>
              {subjects.map((subject, index) => (
                <Surface key={`added-${subject.code || subject.name}-${index}`} 
                  style={[
                    styles.subjectItem,
                    editingIndex === index && styles.editingSubject
                  ]} 
                  elevation={editingIndex === index ? 2 : 0}
                >
                  <View style={styles.subjectInfo}>
                    <Text variant="bodyLarge" style={styles.subjectName}>
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                      {editingIndex === index && " (Editing...)"}
                    </Text>
                    <Text variant="bodySmall" style={styles.subjectStats}>
                      {subject.attended}/{subject.totalClasses} 
                      {Number(subject.dutyLeaves) > 0 && ` (+${subject.dutyLeaves} duty)`}
                      {" "}({getCurrentAttendance(Number(subject.attended), Number(subject.totalClasses), Number(subject.dutyLeaves)).toFixed(1)}%)
                      {" "}| Target: {subject.targetAttendance}%
                    </Text>
                  </View>
                  <View style={styles.subjectActions}>
                    <IconButton icon="pencil" size={20} onPress={() => editSubject(index)} />
                    <IconButton icon="delete" size={20} onPress={() => removeSubject(index)} />
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        <Surface style={styles.buttonContainer} elevation={0}>
          <Button mode="outlined" onPress={() => {
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
            }} style={{ flex: 1, marginRight: 8 }}>← Back</Button>
          
          <Button mode="contained" onPress={goToResults} disabled={subjects.length === 0} style={{ flex: 1, marginLeft: 8 }}>
            View Results →
          </Button>
        </Surface>
        </ScrollView>
      </Surface>
    );
  }

  // Render Results
  if (showResults) {
    const overallStats = getOverallStats();
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContentContainer}>
        <StatusBar style="light" hidden={true} />
        
        <Appbar.Header>
          <Appbar.Content 
            title="Attendance Results" 
            subtitle={`${userProfile.name} | ${userProfile.semester} ${userProfile.branch} | Gender: ${gender}`}
          />
        </Appbar.Header>

        {overallStats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Overall Summary</Text>
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
          const result = evaluateSubject(subject, isFinalAttendance);
          const isEligible = result.status.includes("Eligible");
          const isCondonation = result.status.includes("Condonation");
          
          // Color based on actual attendance percentage
          const isGoodAttendance = result.currentPercent >= 75;
          const isMediumAttendance = result.currentPercent >= 60 && result.currentPercent < 75;
          
          return (
            <View key={index} style={[
              styles.resultCard,
              isGoodAttendance ? styles.eligibleCard : isMediumAttendance ? styles.condonationCard : styles.ineligibleCard
            ]}>
              <Text style={styles.subjectNameResult}>
                {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
              </Text>
              <Text style={[
                styles.statusText,
                isGoodAttendance ? styles.eligibleText : isMediumAttendance ? styles.condonationText : styles.ineligibleText
              ]}>
                {result.status}
              </Text>
              
              <View style={styles.resultStats}>
                <Text style={styles.resultText}>
                  <Text style={{ fontWeight: 'bold' }}>Current:</Text> {result.currentPercent.toFixed(1)}%
                </Text>
                <Text style={styles.resultText}>
                  Total Hours: {(() => {
                    const adjusted = adjustForMaternity(subject);
                    return adjusted.total;
                  })()}
                </Text>
                <Text style={styles.resultText}>
                  Attended: {subject.attended}
                </Text>
                <Text style={styles.resultText}>
                  Target: {subject.targetAttendance}%
                </Text>
                
                {result.isFinal ? (
                  <Text style={[styles.resultText, { fontWeight: 'bold', marginTop: 4, color: '#58a6ff' }]}>
                    📋 Final Semester Result - No more classes to attend
                  </Text>
                ) : (
                  <>
                    {(result.status.includes("Target Achieved") || result.status.includes("University Min")) && (
                      <>
                        <Text style={styles.resultText}>
                          <Text style={{ fontWeight: 'bold' }}>Must attend:</Text> {result.mustAttend} more {result.mustAttend === 1 ? 'class' : 'classes'}
                        </Text>
                        <Text style={styles.resultText}>
                          <Text style={{ fontWeight: 'bold' }}>Can bunk:</Text> {result.canBunk} {result.canBunk === 1 ? 'class' : 'classes'}
                        </Text>
                        <Text style={styles.resultText}>
                          Classes not attended: {result.remaining}
                        </Text>
                        {Number(subject.dutyLeaves) > 0 && (
                          <Text style={styles.resultText}>
                            Duty leaves: {subject.dutyLeaves}
                          </Text>
                        )}
                      </>
                    )}
                    
                    {result.status.includes("Condonation") && (
                      <>
                        <Text style={[styles.resultText, { color: '#f85149' }]}>
                          ⚠️ <Text style={{ fontWeight: 'bold' }}>Need</Text> {result.mustAttend} {result.mustAttend === 1 ? 'class' : 'classes'} to reach {result.targetAttendance}% target
                        </Text>
                        <Text style={styles.resultText}>
                          Safe to bunk: 0 class (too risky!)
                        </Text>
                        <Text style={styles.resultText}>
                          Classes not attended: {result.remaining}
                        </Text>
                        <Text style={[styles.resultText, { color: '#f1e05a' }]}>
                          💡 Currently above 60% - condonation available
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
                          Reason: {result.reason}
                        </Text>
                        {result.classesNeededForTarget > 0 && (
                          <Text style={styles.resultText}>
                            Need {result.classesNeededForTarget} more {result.classesNeededForTarget === 1 ? 'class' : 'classes'} for {result.targetAttendance}% target
                          </Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => setShowResults(false)} style={{ flex: 1, marginRight: 8 }}>
            ← Back to Subjects
          </Button>
          <Button mode="contained" onPress={resetApp} style={{ flex: 1, marginLeft: 8 }}>
            Start Over
          </Button>
        </View>

        <View style={styles.footerPrivacy}>
          <Text style={styles.footerPrivacyText}>
            All your data is stored locally and privately on your device
          </Text>
        </View>

        {/* Social Media Links */}
        <View style={styles.socialLinksContainer}>
          <Text style={styles.socialLinksTitle}>Check me out</Text>
          <View style={styles.socialButtonsContainer}>
            <View style={styles.socialButtonsTopRow}>
              <Button 
                mode="contained-tonal" 
                icon="instagram" 
                onPress={() => {
                  Linking.openURL("https://www.instagram.com/the.adhithyan?igsh=ZHRicWh5eGdheWtq").catch(err => 
                    console.error("Failed to open Instagram link:", err)
                  );
                }}
                style={styles.socialButton}
                buttonColor="#E4405F"
                textColor="#ffffff"
              >
                Instagram
              </Button>
              <Button 
                mode="contained-tonal" 
                icon="linkedin" 
                onPress={() => {
                  Linking.openURL("https://www.linkedin.com/in/adhithyan-k-r/").catch(err => 
                    console.error("Failed to open LinkedIn link:", err)
                  );
                }}
                style={styles.socialButton}
                buttonColor="#0A66C2"
                textColor="#ffffff"
              >
                LinkedIn
              </Button>
            </View>
            <View style={styles.socialButtonsBottomRow}>
              <Button 
                mode="contained-tonal" 
                icon="github" 
                onPress={() => {
                  Linking.openURL("https://github.com/theadhithyankr").catch(err => 
                    console.error("Failed to open GitHub link:", err)
                  );
                }}
                style={styles.socialButtonSingle}
                buttonColor="#333333"
                textColor="#ffffff"
              >
                GitHub
              </Button>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportContainer}>
          <Button 
            mode="contained" 
            icon="cup" 
            onPress={() => {
              setProteinShakeModalVisible(true);
            }}
            style={styles.coffeeButton}
            buttonColor="#4CAF50"
            textColor="#ffffff"
          >
            Buy me a protein shake
          </Button>
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

        {/* Protein Shake Payment Modal */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={proteinShakeModalVisible}
          onRequestClose={() => setProteinShakeModalVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <View style={styles.proteinShakeContainer}>
              <Text style={styles.proteinShakeTitle}>Buy me a protein shake</Text>
              
              {/* Show description for selected amount */}
              <Text style={styles.proteinShakeDescription}>
                ₹{proteinShakeAmount} – {proteinShakeDescriptions[proteinShakeAmount]}
              </Text>
              
              <View style={styles.amountGrid}>
                {[5, 25, 50, 75, 100, 1000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountBox,
                      proteinShakeAmount === amount && styles.amountBoxSelected
                    ]}
                    onPress={() => setProteinShakeAmount(amount)}
                  >
                    <Text style={[
                      styles.amountText,
                      proteinShakeAmount === amount && styles.amountTextSelected
                    ]}>
                      ₹{amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.proteinShakeButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setProteinShakeModalVisible(false)}
                  style={styles.proteinShakeCancelButton}
                  textColor="#666"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    const upiUrl = `upi://pay?pa=theadhithyankr-1@oksbi&pn=${encodeURIComponent("Adhithyan")}&am=${proteinShakeAmount}&cu=INR&tn=${encodeURIComponent("Protein Shake - KTU Attendance App")}`;
                    Linking.openURL(upiUrl).catch(() => {
                      Alert.alert("UPI Payment", `UPI ID: theadhithyankr-1@oksbi\nAmount: ₹${proteinShakeAmount}`);
                    });
                    setProteinShakeModalVisible(false);
                  }}
                  style={styles.proteinShakePayButton}
                  buttonColor="#4CAF50"
                  textColor="#ffffff"
                >
                  Pay ₹{proteinShakeAmount}
                </Button>
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
      <StatusBar style="light" hidden={true} />
      <Text style={styles.welcomeTitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Focus app dark theme
  },
  scrollContent: {
    padding: 16,
  },
  resultsContentContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom actions
  },
  profileSetupContainer: {
    padding: 16,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  privacyCard: {
    marginBottom: 16,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAED',
    marginBottom: 8,
    textAlign: 'left', // Keep this left-aligned as it's part of a horizontal layout
  },
  privacyText: {
    lineHeight: 20,
  },
  profileCard: {
    marginBottom: 16,
  },
  subjectCard: {
    marginBottom: 16,
  },
  subjectsListCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8EAED',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  importOptionsContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#2D2D30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5F6368',
  },
  sectionTitle: {
    color: '#E8EAED',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  importButton: {
    backgroundColor: '#238636',
    marginBottom: 12,
  },
  optionButtonContent: {
    paddingVertical: 8,
  },
  importHelpText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#9AA0AC',
    lineHeight: 16,
    fontSize: 12,
  },
  importSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#2D2D30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5F6368',
  },
  importButtonContent: {
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  requiredNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  privacyReminder: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  privacyReminderText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  editingSubject: {
    borderWidth: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectName: {
    marginBottom: 4,
  },
  subjectStats: {
    opacity: 0.7,
  },
  footerPrivacy: {
    marginTop: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#2D2D30",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5F6368",
  },
  footerPrivacyText: {
    fontSize: 12,
    color: "#9AA0AC",
    textAlign: "center",
    fontStyle: "italic",
  },
  socialLinksContainer: {
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#2D2D30",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5F6368",
    alignItems: "center",
  },
  socialLinksTitle: {
    fontSize: 14,
    color: "#E8EAED",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  socialButtonsContainer: {
    alignItems: "center",
  },
  socialButtonsTopRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  socialButtonsBottomRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    borderRadius: 8,
    minWidth: 100,
    flex: 1,
  },
  socialButtonSingle: {
    borderRadius: 8,
    minWidth: 100,
  },
  supportContainer: {
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#2D2D30",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5F6368",
    alignItems: "center",
  },
  supportTitle: {
    fontSize: 14,
    color: "#E8EAED",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  coffeeButton: {
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 160,
  },
  supportText: {
    fontSize: 12,
    color: "#9AA0AC",
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
    fontSize: 32,
    fontWeight: "900",
    color: "#f0f6fc",
    textAlign: "center",
    marginTop: 59,
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    padding: 16,
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
    color: "#E8EAED",
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9AA0AC",
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8EAED',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
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
    padding: 12,
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
    padding: 12,
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
    marginTop: 16,
    marginHorizontal: 8,
    paddingBottom: 16,
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
    backgroundColor: "#35363A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#81C995",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8EAED",
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
    marginBottom: 16,
    marginHorizontal: 4, // Small horizontal margin to prevent edge touching
    borderWidth: 1,
    backgroundColor: '#2D2D30',
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
    padding: 16,
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
  proteinShakeContainer: {
    backgroundColor: "#21262d",
    borderRadius: 12,
    padding: 20,
    minWidth: 320,
    maxWidth: 380,
    borderColor: "#30363d",
    borderWidth: 1,
  },
  proteinShakeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 20,
    textAlign: "center",
  },
  proteinShakeDescription: {
    fontSize: 14,
    color: "#8b949e",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
    paddingHorizontal: 8,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  amountBox: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: "center",
    marginBottom: 8,
  },
  amountBoxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f0f6fc",
  },
  amountTextSelected: {
    color: "#ffffff",
  },
  proteinShakeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  proteinShakeCancelButton: {
    flex: 1,
    borderColor: "#666",
  },
  proteinShakePayButton: {
    flex: 1,
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
  previewCard: {
    marginBottom: 16,
  },
  mappingContainer: {
    marginTop: 8,
  },
  mappingText: {
    color: '#9AA0AC',
    fontSize: 14,
    marginBottom: 4,
  },
  previewSubjectCard: {
    backgroundColor: '#21262d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  previewSubjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewSubjectCode: {
    color: '#f0f6fc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewAttendance: {
    color: '#238636',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewSubjectName: {
    color: '#f0f6fc',
    fontSize: 14,
    marginBottom: 8,
  },
  previewSubjectDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewDetailText: {
    color: '#9AA0AC',
    fontSize: 12,
  },
  previewButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  previewButton: {
    flex: 0,
  },
  importNavigationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#21262d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  importNavigationText: {
    color: '#f0f6fc',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  importNavigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  navigationButton: {
    flex: 1,
  },
  finalAttendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#21262d',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  finalAttendanceLabel: {
    color: '#f0f6fc',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
