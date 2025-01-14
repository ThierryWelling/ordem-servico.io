import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    companyName: string;
    logoPath: string | null;
}

const initialState: SettingsState = {
    companyName: '',
    logoPath: null
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateCompanyName: (state, action: PayloadAction<string>) => {
            state.companyName = action.payload;
        },
        updateLogoPath: (state, action: PayloadAction<string | null>) => {
            state.logoPath = action.payload;
        },
        setSettings: (state, action: PayloadAction<SettingsState>) => {
            state.companyName = action.payload.companyName;
            state.logoPath = action.payload.logoPath;
        }
    }
});

export const { updateCompanyName, updateLogoPath, setSettings } = settingsSlice.actions;
export default settingsSlice.reducer; 