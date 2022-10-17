import { StyleSheet, Platform, StatusBar  } from "react-native";

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight-10 : 15
    },
    roundedXl: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    roundedXY: {
        borderRadius: 30
    }
});


export default styles;