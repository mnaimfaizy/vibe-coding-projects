import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';

interface FormInputProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  icon?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  secureTextEntry,
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        secureTextEntry={secureTextEntry && !showPassword}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        mode="outlined"
        error={!!error}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : undefined
        }
        style={styles.input}
        outlineStyle={styles.outline}
        {...props}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.error}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderRadius: 8,
  },
  error: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});
