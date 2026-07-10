import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import Trip from "../models/Trip.js";
import Itinerary from "../models/Itinerary.js";
import Expense from "../models/Expense.js";
import PackingChecklist from "../models/PackingChecklist.js";

// ============================================
// Generate Travel Itinerary PDF
// ============================================
export const generateTripPDF = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch all related trip data
    const trip = await Trip.findOne({ _id: tripId, createdBy: req.user.id });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or unauthorized",
      });
    }

    const itineraries = await Itinerary.find({ tripId }).sort({ dayNumber: 1 });
    const expenses = await Expense.find({ tripId }).sort({ date: 1 });
    const packingList = await PackingChecklist.find({ tripId }).sort({ category: 1 });

    // Generate QR Code containing the trip detail link
    // (mock domain for simulation, pointing to frontend detail page)
    const tripDetailUrl = `http://localhost:5173/trips/${tripId}`;
    const qrDataUrl = await QRCode.toDataURL(tripDetailUrl, { margin: 1, width: 100 });
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");

    // Initialize PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Stream PDF directly to client response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="TripVault_${trip.title.replace(/\s+/g, "_")}.pdf"`);
    doc.pipe(res);

    // Styling Constants (Premium Luxury Theme: Black, Gold, White)
    const primaryColor = "#111111"; // Deep Charcoal/Black
    const accentColor = "#D4AF37";  // Gold
    const textColor = "#333333";    // Dark Grey
    const lightBg = "#F9F9F9";      // Soft Grey

    // ============================================
    // HEADER SECTION
    // ============================================
    // Draw top luxury gold banner line
    doc.rect(0, 0, 595.28, 15).fill(accentColor);

    // Title
    doc.fillColor(primaryColor)
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("T R I P V A U L T", 50, 40);

    doc.fontSize(10)
       .fillColor(accentColor)
       .text("PREMIUM TRAVEL COMPANION", 53, 65);

    // Draw QR Code on the top right
    doc.image(qrBuffer, 445, 30, { width: 100 });
    doc.fillColor(textColor)
       .fontSize(8)
       .text("Scan QR to view live trip", 448, 135);

    // Trip Core Details
    doc.fillColor(textColor)
       .font("Helvetica-Bold")
       .fontSize(16)
       .text(trip.title.toUpperCase(), 50, 100);

    doc.font("Helvetica")
       .fontSize(10)
       .text(`Destination: ${trip.destination}`, 50, 120)
       .text(`Dates: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`, 50, 135)
       .text(`Budget: INR ${trip.budget.toLocaleString()} | Travelers: ${trip.travelers}`, 50, 150);

    // Divider Line
    doc.moveTo(50, 170).lineTo(545, 170).strokeColor("#DDDDDD").lineWidth(1).stroke();

    let yPosition = 190;

    // ============================================
    // DAILY ITINERARY SECTION
    // ============================================
    doc.fillColor(accentColor)
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("DAILY ITINERARY", 50, yPosition);
    yPosition += 20;

    if (itineraries.length === 0) {
      doc.fillColor(textColor)
         .font("Helvetica-Oblique")
         .fontSize(10)
         .text("No itinerary items registered for this trip yet.", 50, yPosition);
      yPosition += 25;
    } else {
      itineraries.forEach((day) => {
        // Page break if too low
        if (yPosition > 720) {
          doc.addPage();
          doc.rect(0, 0, 595.28, 15).fill(accentColor);
          yPosition = 50;
        }

        doc.fillColor(primaryColor)
           .font("Helvetica-Bold")
           .fontSize(11)
           .text(`Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`, 50, yPosition);
        
        yPosition += 15;

        day.activities.forEach((act) => {
          if (yPosition > 720) {
            doc.addPage();
            doc.rect(0, 0, 595.28, 15).fill(accentColor);
            yPosition = 50;
          }

          // Left border line in Gold for each activity
          doc.moveTo(55, yPosition).lineTo(55, yPosition + 30).strokeColor(accentColor).lineWidth(1.5).stroke();

          doc.fillColor(textColor)
             .font("Helvetica-Bold")
             .fontSize(10)
             .text(`${act.time} - ${act.title}`, 65, yPosition);

          if (act.location) {
            doc.font("Helvetica-Oblique")
               .fontSize(9)
               .text(`Location: ${act.location}`, 65, yPosition + 12);
          }

          doc.font("Helvetica")
             .fontSize(9)
             .fillColor("#555555")
             .text(act.description, 65, yPosition + (act.location ? 24 : 12), { width: 450 });

          // Calculate space height based on activity description length
          const descHeight = doc.heightOfString(act.description, { width: 450 });
          yPosition += (act.location ? 28 : 16) + descHeight + 10;
        });
        yPosition += 10;
      });
    }

    // Divider Line
    if (yPosition > 720) {
      doc.addPage();
      doc.rect(0, 0, 595.28, 15).fill(accentColor);
      yPosition = 50;
    } else {
      doc.moveTo(50, yPosition).lineTo(545, yPosition).strokeColor("#DDDDDD").lineWidth(1).stroke();
      yPosition += 20;
    }

    // ============================================
    // EXPENSES SECTION
    // ============================================
    if (yPosition > 700) {
      doc.addPage();
      doc.rect(0, 0, 595.28, 15).fill(accentColor);
      yPosition = 50;
    }

    doc.fillColor(accentColor)
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("EXPENSE REPORT", 50, yPosition);
    yPosition += 20;

    if (expenses.length === 0) {
      doc.fillColor(textColor)
         .font("Helvetica-Oblique")
         .fontSize(10)
         .text("No expenses logged for this trip yet.", 50, yPosition);
      yPosition += 25;
    } else {
      // Draw Table Header
      doc.rect(50, yPosition, 495, 20).fill(primaryColor);
      doc.fillColor("#FFFFFF")
         .font("Helvetica-Bold")
         .fontSize(9)
         .text("Category", 60, yPosition + 6)
         .text("Expense Details", 150, yPosition + 6)
         .text("Amount", 450, yPosition + 6, { width: 80, align: "right" });

      yPosition += 20;
      let totalExpenseSum = 0;

      expenses.forEach((exp) => {
        if (yPosition > 720) {
          doc.addPage();
          doc.rect(0, 0, 595.28, 15).fill(accentColor);
          yPosition = 50;
          // Redraw header on new page
          doc.rect(50, yPosition, 495, 20).fill(primaryColor);
          doc.fillColor("#FFFFFF")
             .font("Helvetica-Bold")
             .fontSize(9)
             .text("Category", 60, yPosition + 6)
             .text("Expense Details", 150, yPosition + 6)
             .text("Amount", 450, yPosition + 6, { width: 80, align: "right" });
          yPosition += 20;
        }

        // Alternate row colors
        if (totalExpenseSum % 2 === 0) {
          doc.rect(50, yPosition, 495, 18).fill(lightBg);
        }

        doc.fillColor(textColor)
           .font("Helvetica")
           .fontSize(9)
           .text(exp.category, 60, yPosition + 4)
           .text(exp.title, 150, yPosition + 4)
           .text(`${exp.currency} ${exp.amount.toLocaleString()}`, 450, yPosition + 4, { width: 80, align: "right" });

        totalExpenseSum += exp.amount;
        yPosition += 18;
      });

      // Total Row
      doc.rect(50, yPosition, 495, 20).fill("#EAEAEA");
      doc.fillColor(primaryColor)
         .font("Helvetica-Bold")
         .fontSize(10)
         .text("Total Spent", 60, yPosition + 5)
         .text(`INR ${totalExpenseSum.toLocaleString()}`, 450, yPosition + 5, { width: 80, align: "right" });
      
      yPosition += 35;
    }

    // Divider Line
    if (yPosition > 720) {
      doc.addPage();
      doc.rect(0, 0, 595.28, 15).fill(accentColor);
      yPosition = 50;
    } else {
      doc.moveTo(50, yPosition).lineTo(545, yPosition).strokeColor("#DDDDDD").lineWidth(1).stroke();
      yPosition += 20;
    }

    // ============================================
    // PACKING CHECKLIST SECTION
    // ============================================
    if (yPosition > 700) {
      doc.addPage();
      doc.rect(0, 0, 595.28, 15).fill(accentColor);
      yPosition = 50;
    }

    doc.fillColor(accentColor)
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("PACKING CHECKLIST", 50, yPosition);
    yPosition += 20;

    if (packingList.length === 0) {
      doc.fillColor(textColor)
         .font("Helvetica-Oblique")
         .fontSize(10)
         .text("No packing checklist items registered yet.", 50, yPosition);
      yPosition += 25;
    } else {
      // Print checklist items in two columns
      let xPos = 50;
      let leftColY = yPosition;
      let rightColY = yPosition;

      packingList.forEach((item, index) => {
        const isLeft = index % 2 === 0;
        let itemY = isLeft ? leftColY : rightColY;

        if (itemY > 720) {
          doc.addPage();
          doc.rect(0, 0, 595.28, 15).fill(accentColor);
          leftColY = 50;
          rightColY = 50;
          itemY = 50;
        }

        const currentX = isLeft ? 50 : 300;

        // Draw checklist checkbox
        doc.rect(currentX, itemY + 1, 8, 8).strokeColor(accentColor).lineWidth(1).stroke();
        if (item.isPacked) {
          // Fill checkmark dot if packed
          doc.rect(currentX + 2, itemY + 3, 4, 4).fill(accentColor);
        }

        doc.fillColor(textColor)
           .font(item.isPacked ? "Helvetica-Bold" : "Helvetica")
           .fontSize(9)
           .text(`${item.itemName} (${item.quantity}x) - [${item.priority}]`, currentX + 15, itemY, { width: 220 });

        if (isLeft) {
          leftColY += 18;
        } else {
          rightColY += 18;
        }
      });

      yPosition = Math.max(leftColY, rightColY) + 15;
    }

    // ============================================
    // FOOTER (Luxury Page Numbers)
    // ============================================
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor("#999999")
         .font("Helvetica")
         .fontSize(8)
         .text(`Page ${i + 1} of ${pages.count}  |  TripVault Travel Platform`, 50, 800, { align: "center", width: 495 });
    }

    // Finalize PDF Document
    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }
  }
};
