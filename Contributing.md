<!-- filepath: /home/wabisabi/Desktop/FireDetectionSystemUsingYolo/CONTRIBUTING.md -->
# Contributing to Fire Detection System Using YOLO

Thank you for your interest in contributing to our Fire Detection System! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or helping with testing.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 🚀 Getting Started

### Prerequisites

Before contributing, please ensure you have:

- Python 3.8 or higher
- Git
- Basic knowledge of YOLO, Flask, Django, or React (depending on your contribution area)
- Familiarity with computer vision concepts (for model-related contributions)

### First Time Contributors

If you're new to open source, here are some good first issues to look for:
- Documentation improvements
- Bug fixes
- Adding unit tests
- Improving error messages
- Code refactoring

Look for issues labeled with `good first issue` or `help wanted`.

## 🛠️ Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/FireDetectionSystemUsingYolo.git
   cd FireDetectionSystemUsingYolo
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # If available
   ```

4. **Set up pre-commit hooks** (optional but recommended)
   ```bash
   pip install pre-commit
   pre-commit install
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

1. **🐛 Bug Reports**
   - Use the bug report template
   - Include steps to reproduce
   - Provide system information
   - Include error logs

2. **✨ Feature Requests**
   - Use the feature request template
   - Explain the use case
   - Provide examples
   - Consider implementation details

3. **💻 Code Contributions**
   - Bug fixes
   - New features
   - Performance improvements
   - Code refactoring

4. **📚 Documentation**
   - API documentation
   - Setup guides
   - Tutorials
   - Code comments

5. **🧪 Testing**
   - Unit tests
   - Integration tests
   - Performance tests
   - Test data

### Contribution Areas

#### Flask Video Streamer
- Video processing improvements
- YOLO model integration
- Performance optimizations
- Error handling

#### Django Backend
- API enhancements
- Database optimizations
- WebSocket improvements
- Authentication features

#### React Frontend
- UI/UX improvements
- Real-time features
- Dashboard enhancements
- Mobile responsiveness

#### YOLO Model
- Model training improvements
- Dataset enhancements
- Model optimization
- Accuracy improvements

## 🔄 Pull Request Process

### Before Submitting

1. **Check existing issues/PRs** to avoid duplicates
2. **Test your changes** locally
3. **Update documentation** if needed
4. **Add tests** for new functionality
5. **Follow code style** guidelines

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation has been updated
- [ ] Tests have been added/updated
- [ ] All tests pass locally
- [ ] Changes have been tested on multiple platforms (if applicable)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🎨 Code Style

### Python Code Style

We follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) with some modifications:

```python
# Good
def process_frame(frame, confidence_threshold=0.5):
    """Process video frame for fire detection.
    
    Args:
        frame: Input video frame
        confidence_threshold: Minimum confidence for detection
        
    Returns:
        tuple: (annotated_frame, detection_results)
    """
    results = model.predict(frame, conf=confidence_threshold)
    annotated_frame = results[0].plot()
    return annotated_frame, results

# Use descriptive variable names
fire_detection_confidence = 0.8
camera_location = "Kitchen"

# Add proper error handling
try:
    frame = cap.read()
except Exception as e:
    logger.error(f"Failed to read frame: {e}")
    return None
```

### JavaScript/React Code Style

```javascript
// Use functional components with hooks
const CameraFeed = ({ cameraId, location }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  
  useEffect(() => {
    // Component logic here
  }, [cameraId]);
  
  return (
    <div className="camera-feed">
      <h3>{location} Camera</h3>
      {/* Component JSX */}
    </div>
  );
};
```

### Commit Message Format

```
type(scope): brief description

Detailed explanation of changes made and why.

Fixes #issue_number
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(detection): add confidence threshold configuration

Allow users to configure minimum confidence threshold
for fire detection through environment variables.

Fixes #123
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_detection.py

# Run with coverage
python -m pytest --cov=VideoStreamer

# Run performance tests
python -m pytest tests/performance/
```

### Writing Tests

```python
import pytest
from VideoStreamer.app import annotate_frame

def test_annotate_frame():
    """Test frame annotation functionality."""
    # Arrange
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    location = "Test Camera"
    
    # Act
    annotated_frame, results = annotate_frame(dummy_frame, location)
    
    # Assert
    assert annotated_frame is not None
    assert results is not None
    assert annotated_frame.shape == dummy_frame.shape
```

### Test Coverage

We aim for:
- **Unit tests**: 80%+ coverage
- **Integration tests**: Core functionality
- **Performance tests**: Critical paths

## 📖 Documentation

### Code Documentation

```python
def send_fire_alert(fire_data, snapshot_path, camera_ip):
    """Send fire alert to Django backend.
    
    Args:
        fire_data (dict): Fire detection information
        snapshot_path (str): Path to saved detection image
        camera_ip (str): Camera IP address
        
    Returns:
        bool: True if alert sent successfully, False otherwise
        
    Raises:
        requests.RequestException: If API request fails
        FileNotFoundError: If snapshot file doesn't exist
    """
```

### API Documentation

Update API documentation in `docs/API_DOCUMENTATION.md` for any new endpoints or changes.

### README Updates

Update the main README.md if your changes affect:
- Installation process
- Usage instructions
- Feature list
- Dependencies

## 👥 Community

### Getting Help

- 📖 Check existing [documentation](docs/)
- 🔍 Search [existing issues](https://github.com/yourusername/FireDetectionSystemUsingYolo/issues)
- 💬 Join [discussions](https://github.com/yourusername/FireDetectionSystemUsingYolo/discussions)
- 📧 Contact maintainers

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority:high`: High priority issue
- `priority:medium`: Medium priority issue
- `priority:low`: Low priority issue

## 📞 Support

If you have questions about contributing, please:

1. Check the [FAQ](docs/FAQ.md)
2. Search existing issues and discussions
3. Create a new discussion for questions
4. Create an issue for bugs

Thank you for contributing to the Fire Detection System! 🔥🚀